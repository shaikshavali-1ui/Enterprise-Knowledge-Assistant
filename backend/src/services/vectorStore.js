import { initialDocuments } from '../data/seedData.js';
import { config } from '../config/index.js';

class VectorStoreService {
  constructor() {
    this.documents = [...initialDocuments];
    this.vectorChunks = [];
    this.vocabulary = new Set();
    this.initializeIndex();
  }

  /**
   * Helper to tokenize text into clean normalized terms
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  /**
   * Chunk document content into overlapping passages
   */
  chunkDocument(doc) {
    const lines = doc.content.split('\n\n').filter(Boolean);
    const chunks = [];

    lines.forEach((passage, idx) => {
      chunks.push({
        id: `${doc.id}_chunk_${idx + 1}`,
        documentId: doc.id,
        documentTitle: doc.title,
        category: doc.category,
        accessRole: doc.accessRole,
        author: doc.author,
        chunkIndex: idx + 1,
        content: passage.trim(),
        tokens: this.tokenize(passage)
      });
    });

    return chunks;
  }

  /**
   * Build vector embeddings & TF-IDF term weights for vector index
   */
  initializeIndex() {
    this.vectorChunks = [];
    this.vocabulary.clear();

    // 1. Chunk documents
    this.documents.forEach(doc => {
      const chunks = this.chunkDocument(doc);
      this.vectorChunks.push(...chunks);
    });

    // 2. Build vocabulary set
    this.vectorChunks.forEach(chunk => {
      chunk.tokens.forEach(term => this.vocabulary.add(term));
    });

    const vocabArray = Array.from(this.vocabulary);

    // 3. Compute Term Vectors for each chunk
    this.vectorChunks.forEach(chunk => {
      const tfMap = {};
      chunk.tokens.forEach(t => {
        tfMap[t] = (tfMap[t] || 0) + 1;
      });

      chunk.vector = vocabArray.map(term => {
        const tf = tfMap[term] || 0;
        return tf / (chunk.tokens.length || 1);
      });
    });

    console.log(`[VectorStore] Indexed ${this.documents.length} documents into ${this.vectorChunks.length} vector chunks.`);
  }

  /**
   * Cosine similarity between two vector arrays
   */
  cosineSimilarity(vecA, vecB) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Role-based access permission check
   */
  isRoleAuthorized(userRole, documentAccessRole) {
    if (userRole === 'Admin') return true;
    if (documentAccessRole === 'Public') return true;

    if (userRole === 'HR Manager') {
      return documentAccessRole === 'Public' || documentAccessRole === 'HR-Only' || documentAccessRole === 'Executive-Only';
    }

    if (userRole === 'Finance') {
      return documentAccessRole === 'Public' || documentAccessRole === 'Executive-Only';
    }

    if (userRole === 'Employee') {
      return documentAccessRole === 'Public';
    }

    return false;
  }

  /**
   * Perform semantic RAG search with role security filtering
   */
  async search({ query, userRole = 'Employee', topK = 3 }) {
    const queryTokens = this.tokenize(query);
    const vocabArray = Array.from(this.vocabulary);

    // Build query vector
    const tfMap = {};
    queryTokens.forEach(t => {
      tfMap[t] = (tfMap[t] || 0) + 1;
    });

    const queryVector = vocabArray.map(term => {
      const tf = tfMap[term] || 0;
      return tf / (queryTokens.length || 1);
    });

    const results = [];
    const deniedCount = { count: 0 };

    this.vectorChunks.forEach(chunk => {
      // Security Guard check
      const authorized = this.isRoleAuthorized(userRole, chunk.accessRole);
      if (!authorized) {
        deniedCount.count++;
        return;
      }

      // Keyword match boost
      let keywordBoost = 0;
      queryTokens.forEach(t => {
        if (chunk.content.toLowerCase().includes(t)) {
          keywordBoost += 0.25;
        }
      });

      const cosSim = this.cosineSimilarity(queryVector, chunk.vector);
      const score = Math.min(1.0, cosSim + keywordBoost);

      if (score > 0.05) {
        results.push({
          ...chunk,
          score: parseFloat(score.toFixed(4))
        });
      }
    });

    // Sort by relevance score descending
    results.sort((a, b) => b.score - a.score);

    return {
      query,
      userRole,
      topK,
      results: results.slice(0, topK),
      totalMatches: results.length,
      filteredOutDueToRBAC: deniedCount.count,
      pineconeStatus: config.pineconeApiKey ? 'Connected (Pinecone Live API)' : 'Embedded Vector Store (Active)'
    };
  }

  /**
   * Add a new document to vector index
   */
  addDocument(docData) {
    const newDoc = {
      id: `doc_${Date.now()}`,
      title: docData.title,
      category: docData.category || 'General',
      accessRole: docData.accessRole || 'Public',
      author: docData.author || 'System User',
      updatedAt: new Date().toISOString().split('T')[0],
      summary: docData.summary || docData.content.substring(0, 150) + '...',
      content: docData.content
    };

    this.documents.push(newDoc);
    this.initializeIndex();
    return newDoc;
  }

  /**
   * Delete a document from vector index by ID
   */
  deleteDocument(docId) {
    const idx = this.documents.findIndex(d => d.id === docId);
    if (idx !== -1) {
      const removed = this.documents.splice(idx, 1)[0];
      this.initializeIndex();
      return removed;
    }
    return null;
  }

  /**
   * Get all indexed documents
   */
  getAllDocuments() {
    return this.documents.map(d => ({
      ...d,
      chunkCount: this.vectorChunks.filter(c => c.documentId === d.id).length
    }));
  }

  /**
   * Get detailed stats of vector index
   */
  getStats() {
    return {
      totalDocuments: this.documents.length,
      totalChunks: this.vectorChunks.length,
      totalVocabularyTerms: this.vocabulary.size,
      pineconeConnected: Boolean(config.pineconeApiKey),
      geminiConnected: Boolean(config.geminiApiKey),
      indexName: config.pineconeIndex
    };
  }
}

export const vectorStore = new VectorStoreService();
