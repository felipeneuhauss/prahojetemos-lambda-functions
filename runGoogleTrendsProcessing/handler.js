const handler = require('./index');
handler.handler({
  Records: [
    {
      messageId: 'f6d226d6-75c7-4d0e-a6c8-66d66971cf46',
      receiptHandle: 'AQEBHfjn5oLyevJToE7hsYa/EYfgXgvR6vC0PSBDX6yH4iz7TtrxtiMBmSvzMHzNezo6v4yG8d6m+7gFEUDG9Ng+GlPLzXz67SQUo4uP/Ft6SHcdUm4Q9szw8LQDfYm5BJaEXkal61ecaUap+5EokxjpPsFFjYWVSUvx+nYpZ9bjSTnIb5BIaSWOQWaGLiPYAm9IDxskkPCl8ckeUPq6MYq/jynj8B63lQKZaE+NlkwrC+5UJtwJW6v0KtsoK3oDDhJTc38grJFjRgB3ae97EFOnz/XwoFBfgxh4cxaERUr2W5w2W2QXg3gN24nEI0lMLrFs1niTy+dxar85iPHkRXBVd/bb0eg8PA4eGjBwfJ5c/bK8MrKmdpNy6wOjSx8BvzRLJU+ErMX9cpJfsUj/8B7E9A==',
      body: '{"title":"Teste de míssil intercontinental dos EUA: veja perguntas e respostas; vídeo","description":"Americanos disseram que ação não foi resultado de nenhum evento global específico","imageUrl":"//t1.gstatic.com/images?q=tbn:ANd9GcT_YtxJ8coF-knHy8OiqxfLLKBA_jFzBKfAJ7gwXDysQ8t97tl7Nlk0sNNifslmc1trd-7IQtkHKvg","url":"https://g1.globo.com/mundo/noticia/2022/08/16/teste-de-missil-intercontinental-dos-eua-veja-perguntas-e-respostas.ghtml"}',
      attributes: [Object],
      messageAttributes: {},
      md5OfBody: '426f4899fc7b4a711eb5d3350ca1e8cf',
      eventSource: 'aws:sqs',
      eventSourceARN: 'arn:aws:sqs:us-east-1:503662028996:processTopNews',
      awsRegion: 'us-east-1'
    }
  ]
}
);
