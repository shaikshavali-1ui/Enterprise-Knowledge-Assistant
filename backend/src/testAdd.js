async function testAdd() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/users/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alex Rivera',
        email: 'alex.rivera@enterprise.com',
        role: 'Employee',
        department: 'Engineering'
      })
    });
    const data = await res.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testAdd();
