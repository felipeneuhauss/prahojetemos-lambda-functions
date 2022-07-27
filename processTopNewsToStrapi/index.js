const axios = require('axios');
const { parse } = require('node-html-parser');
const FormData = require('form-data');

const extractTopNewsDescription = async (url) => {
  const { data } = await axios.get(url);
  const dom = parse(data);
  return dom.querySelectorAll('.content-text').map((el) => el.textContent).join('');
}

const rewriteDescription = async (description) => {
  const formData = new FormData();
  formData.append('text', description);
  formData.append('level', 'best');
  formData.append('dest', 'pt');

  const { data } = await axios.post(
    'https://paraphrasingtool.ai/wp-content/plugins/aiparaphrasingtool/requests/paraphrase.php',
    formData,
    {
      headers: {
        "accept": "*/*",
        "accept-language": "en-GB,en;q=0.9",
        "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7Lx84HnvbbACuHgR",
        "sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest"
      }
    }
  );
  return data.result.replace(/<[^>]*>?/gm, '');
}

const saveStrapi = async (payload) => {
  const { data: { data: { id } } } = await axios.post('https://prahojetemos-strapi.herokuapp.com/api/top-news', {
    data: payload
  }, {
    headers: {
      authorization: `Bearer ${process.env.STRAPI_API_TOKEN}`
    }
  });

  console.log('Data saved:', id);
}

exports.handler = async (event) => {

  const response = {
    statusCode: 200,
    body: JSON.stringify('Data processed!'),
  };

  try {
    console.log('Event:', JSON.stringify(event));
    // TODO implement
    const { Records: records } = event;
    const messagePayload = records[0];
    const { messageAttributes } = messagePayload;
    const slug = messageAttributes.url.stringValue.split('/').pop();
    const payload = {
      title: messageAttributes.title.stringValue,
      slug: slug,
      description: messageAttributes.description.stringValue,
      imageUrl: messageAttributes.imageUrl.stringValue,
      url: messageAttributes.url.stringValue
    }
    // 1 - Fazer o crawler da noticia do g1
    payload.description = await extractTopNewsDescription(payload.url);

    // 2 - Parafrasear a noticia
    payload.description = await rewriteDescription(payload.description);

    // 3 -  Salvar no strapi
    await saveStrapi(payload);

    return response;
  } catch (e) {
    console.log('error:', e.stack);
    return response;
  }
};
