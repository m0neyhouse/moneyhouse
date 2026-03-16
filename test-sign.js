const http = require('http');

const data = JSON.stringify({
  clientName: 'Test Server',
  serviceName: 'Test Service',
  value: 100
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/contracts',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Contract created:', responseData);
    const contract = JSON.parse(responseData).data;
    if (!contract) return;
    
    // Agora tenta assinar
    const signData = JSON.stringify({
      signatureImage: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    });
    
    const signReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/contracts/' + contract.id,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': signData.length
      }
    }, (signRes) => {
      let signResponseData = '';
      signRes.on('data', (d) => signResponseData += d);
      signRes.on('end', () => console.log('Sign response:', signResponseData));
    });
    
    signReq.on('error', console.error);
    signReq.write(signData);
    signReq.end();
  });
});

req.on('error', console.error);
req.write(data);
req.end();
