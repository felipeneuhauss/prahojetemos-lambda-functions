const googleTrends = require('google-trends-api');

const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const handler = async (event) => {
  console.log('Event:', JSON.stringify(event));

  const realTimeTrends = await googleTrends.realTimeTrends({
    category: 'h',
    geo: 'BR',
  });

  const trendList = JSON.parse(realTimeTrends).storySummaries
    ?.trendingStories.filter((trendingStory) => trendingStory.articles.length > 2);

  let g1Article;
  let selectedTrend;

  for (let trend of trendList) {
    if (!g1Article) {
      for (let article of trend.articles) {
        if (article.url.includes('g1.globo.com')) {
          g1Article = article;
          break;
        }
      }
      continue;
    }
    selectedTrend = trend;
    break;
  }

  const payload = {
    DelaySeconds: 0,
    MessageBody: JSON.stringify({
      title: g1Article.articleTitle,
      description: g1Article.snippet,
      imageUrl: selectedTrend.image.imgUrl,
      url: g1Article.url
    }),
    QueueUrl: 'https://sqs.us-east-1.amazonaws.com/503662028996/callProcessTopNewsToStrapi',
  }

  try {
    const data = await sqs.sendMessage(payload).promise()
    console.log('Message sent', data.MessageId);
  } catch (e) {
    console.log('Message error:', e.stack);
  }
  // TODO implement
  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};

handler();
