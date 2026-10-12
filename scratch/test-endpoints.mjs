const testEndpoints = async () => {
  console.log('Testing localhost:5265 endpoints...');

  // 1. DB Validation
  const dbPayload = {
    xml: '<mxGraphModel><root><mxCell id="0"/></root></mxGraphModel>',
    lang: 'th',
    vendor: 'postgresql'
  };

  const dbRes = await fetch('http://localhost:5265/api/ai/validate-db-design', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dbPayload)
  });
  console.log('DB Validation status:', dbRes.status);
  const dbJson = await dbRes.json();
  console.log('DB Validation body:', dbJson);

  // 2. Bug Resolution
  const bugPayload = {
    title: 'Test bug',
    description: 'Test description',
    lang: 'th'
  };

  const bugRes = await fetch('http://localhost:5265/api/pm/bugs/ai-smart-resolution', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bugPayload)
  });
  console.log('Bug Resolution status:', bugRes.status);
  const bugJson = await bugRes.json();
  console.log('Bug Resolution body:', bugJson);
};

testEndpoints().catch(console.error);
