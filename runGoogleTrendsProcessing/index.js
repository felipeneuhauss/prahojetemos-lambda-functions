const axios = require('axios');
const {parse} = require('node-html-parser');
const FormData = require('form-data');
const slufigy = require('slugify');

const saveDataIntoStrapi = async (payload) => {
  const {data: {data: responseData}} = await axios.post(
    'https://prahojetemos-strapi.herokuapp.com/api/top-news', {data: payload},
    {
      headers: {
        authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`
      }
    });
  console.log('Top news saved:', responseData);
}

const extractTopNewsDescription = async (url) => {
  const {data} = await axios.get(url);
  const dom = parse(data);
  return dom.querySelectorAll('.content-text').map((el) => el.textContent).join('');
}

const rewriteText = async (text) => {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('level', 'best'); // one, good, best
  formData.append('dest', 'pt'); // en, pt

  const {data} = await axios.post(
    "https://paraphrasingtool.ai/wp-content/plugins/aiparaphrasingtool/requests/paraphrase.php",
    formData,
    {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary66oRXx2e6nEtdZ7M",
        "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      }
    }
  );

  return data.result.replace(/(<([^>]+)>)/ig, '');
}

exports.handler = async (event) => {
  console.log('Event:', event);
  const {Records: records} = event;
  const messagePaylaod = records[0];
  const body = JSON.parse(messagePaylaod.body);
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };

  try {
    // 1 - Obter da URL o conteudo da noticia
    const payload = {
      title: body.title,
      slug: '', // TODO implementar slugify - todo-implementar-slugify
      description: body.description,
      imageUrl: body.imageUrl,
      url: body.url,
    }

    // 2 - Reescrever a noticia
    payload.description = await extractTopNewsDescription(payload.url);
    payload.description = await rewriteText(payload.description);
    payload.title = await rewriteText(payload.title);
    payload.slug = slufigy(payload.title.toLowerCase());
    // 3 - Salvar no strapi a noticia da capa - TopNews
    await saveDataIntoStrapi(payload);
  } catch (e) {
    console.log('Error:', e.message);
  }

  return response;
};


