export async function pinToIpfsJson({ data, name, keyvalues }) {
  const resp = await fetch('http://localhost:5001/api/pinata/json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data, name, keyvalues }),
  });

  const body = await resp.json().catch(() => ({}));

  if (!resp.ok || !body?.ok) {
    const message = body?.error ? JSON.stringify(body.error) : 'Pinata upload failed';
    throw new Error(message);
  }

  return body.cid;
}
