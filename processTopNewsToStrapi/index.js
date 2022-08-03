const axios = require('axios');
const {parse} = require('node-html-parser');
const FormData = require('form-data');

const extractTopNewsDescription = async (url) => {
  const {data} = await axios.get(url);
  const dom = parse(data);
  return dom.querySelectorAll('.content-text').map((el) => el.textContent).join('')
}

const saveToStrapi = async (payload) => {
  const {data: {data: {id}}} = await axios.post('https://prahojetemos-strapi.herokuapp.com/api/top-news', {
    data: payload,
  }, {
    headers: {
      authorization: `Bearer d35aa691c41eec2646ae839ad7a28bacee58c376d4f92f415014e17336896d13a50fe7c87bb01b2d97e4fddc1a736f589b7692f0ff00fbe316e3b65b0266bb011de5dbd3c36b7bf57946f4d5cf9f443769b6152ee188e8ac4a0a4ae9bfeb74056c3faaa5d284d90041008cd1156c6273720a887d29f4794a4d7de62d85da360b`,
    }
  })
  console.log('Data saved: ', id);
}

const rewriteDescription = async (description) => {
  const formData = new FormData();
  formData.append('text', description);
  formData.append('level', 'best');
  formData.append('dest', 'pt');
  const {data} = await axios.post('https://paraphrasingtool.ai/wp-content/plugins/aiparaphrasingtool/requests/paraphrase.php',
    formData,
    {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundaryIobA9kF5yUb5SL2s",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
      },
    });

  return data.result.replace(/<[^>]*>?/gm, '');
}

const handler = async (event) => {
  const {Records: records} = event;
  const messagePayload = records[0];
  const {messageAttributes} = messagePayload;
  const slug = messageAttributes.url.stringValue.split('/').pop();

  const payload = {
    title: messageAttributes.title.stringValue,
    slug: messageAttributes.slug.stringValue,
    description: messageAttributes.description.stringValue,
    imageUrl: messageAttributes.imageUrl.stringValue,
    url: messageAttributes.url.stringValue,
  }
  // Extract news description
  payload.description = await extractTopNewsDescription(payload.url);

  // Improve news text
  payload.description = await rewriteDescription(payload.description);

  // Save into Strapi
  await saveToStrapi(payload);

  console.log('payload', payload);

  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};

handler({
    "Records": [
      {
        "messageId": "01a86098-8181-4105-b6f6-694faa51e8ce",
        "receiptHandle": "AQEB589X3rHsUoLhLxkOUH8rJQtRvQe093Mj8tPL26ZwRMxd8UqwQfuj3owkUW7W1Yay/2Mh8mRO0BL33bwNU5PE2XgYl3W26Ww1YIbXT0EE+cfycut7PdyLg9tGzsbJ3QXwt2qSSKRgmU8hvJLcv2oJ04zF7S8Fixmg/bxOvY98fGIg2MTuCK8OmotJx4BCq09MswbUWSRSagDxp/S8868YL3ASMkn50BOojjKw/c2bZxz50Xpzc70x9MAuCXZlqukQe2Kd1bP4MoTd/ITKVlvDWqWIPSuBoE1viXU1od/MKfRSQuFSVE0qgXtg4P75W3aIjsjtZ0pfOC4fYQZYRfV9D7TLcJ9RRVgnBL9rKMHPu3sEwZJRC4U99Rtztq9bE1udEPd9Dcdc7LhKyMh1iuAJ7A==",
        "body": "TopNews sent to be processed and saved in the Strapi CMS.",
        "attributes": {
          "ApproximateReceiveCount": "4",
          "SentTimestamp": "1659458831394",
          "SenderId": "AROAXKREYVDCGH2HJ3NDM:fetchGoogleTrends",
          "ApproximateFirstReceiveTimestamp": "1659458831394"
        },
        "messageAttributes": {
          "imageUrl": {
            "stringValue": "//t3.gstatic.com/images?q=tbn:ANd9GcTwCHahu2nYIREelxIRH6AQJ1nctIIDlpGHlspD-MSN9rUkMxDdSvq4siZ46ePKaNdUT4FGDrtUdA0",
            "stringListValues": [],
            "binaryListValues": [],
            "dataType": "String"
          },
          "description": {
            "stringValue": "Quem é mais forte? Jogadores de Timão e Fla mostram larga experiência e são ou foram consistentes na seleção brasileira; Vidal, Arrascaeta e Balbuena engrossam lista por seus países.",
            "stringListValues": [],
            "binaryListValues": [],
            "dataType": "String"
          },
          "title": {
            "stringValue": "Corinthians x Flamengo: elencos somam quase 700 jogos por seleções e têm vivência na Europa",
            "stringListValues": [],
            "binaryListValues": [],
            "dataType": "String"
          },
          "slug": {
            "stringValue": "corinthians-flamengo",
            "stringListValues": [],
            "binaryListValues": [],
            "dataType": "String"
          },
          "url": {
            "stringValue": "https://ge.globo.com/futebol/times/corinthians/noticia/2022/08/02/corinthians-x-flamengo-elencos-somam-quase-700-jogos-por-selecoes-e-tem-vivencia-na-europa.ghtml",
            "stringListValues": [],
            "binaryListValues": [],
            "dataType": "String"
          }
        },
        "md5OfMessageAttributes": "f66346934c002304e6877b9e4eb05d0c",
        "md5OfBody": "4ac66f4013956dbc02b19137ed20e161",
        "eventSource": "aws:sqs",
        "eventSourceARN": "arn:aws:sqs:us-east-1:503662028996:processTopNews",
        "awsRegion": "us-east-1"
      }
    ]
  }
);
