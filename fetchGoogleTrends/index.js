const googleTrends = require('google-trends-api');
const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

exports.handler = async (event) => {
  const realTimeTrends = await googleTrends.realTimeTrends({
    category: 'h',
    geo: 'BR',
  });

  const trendList = JSON.parse(realTimeTrends).storySummaries
    ?.trendingStories.filter((trendingStory) =>
      trendingStory.articles.length > 2);

  // Mandar a noticia do g1
  let g1Article;
  let selectedTrend;

  for (let trend of trendList) {
    if (!g1Article) {
      for (let article of trend.articles) {
        if (article.url.includes('globo.com')) {
          g1Article = article;
          break;
        }
      }
      continue;
    }
    selectedTrend = trend;
    break;
  }

  const params = {
    DelaySeconds: 10,
    MessageAttributes: {
      title: {
        DataType: 'String',
        StringValue: g1Article.articleTitle
      },
      url: {
        DataType: 'String',
        StringValue: g1Article.url
      },
      description: {
        DataType: 'String',
        StringValue: g1Article.snippet
      },
      imageUrl: {
        DataType: 'String',
        StringValue: selectedTrend.image.imgUrl,
      }
    },
    MessageBody: 'TopNews sent to be processed and saved in the Strapi CMS.',
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/503662028996/processTopNews'
  };

  try {
    const data = await sqs.sendMessage(params).promise()
    console.log('Message successufully sent', data);
  } catch (err) {
    console.log('err:', err);
  }
};
