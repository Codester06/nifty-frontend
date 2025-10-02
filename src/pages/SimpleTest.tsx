const SimpleTest = () => {
  console.log('SimpleTest component rendered');
  
  return (
    <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '24px' }}>Simple Test Page</h1>
      <p style={{ color: 'black' }}>This is a simple test to check if routing works.</p>
      <p style={{ color: 'black' }}>If you can see this, the routing is working.</p>
    </div>
  );
};

export default SimpleTest;