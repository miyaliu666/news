const { ghostAPI } = require('../api');
const wait = require('../wait');

const fetchFromGhost = async endpoint => {
  let currPage = 1;
  let lastPage = 5;
  let data = [];
  const options = {
    include: ['tags', 'authors'],
    filter: 'status:published',
    limit: 200
  };

  if (process.env.DO_NOT_FETCH_FROM_GHOST) {
    console.log(
      'DO_NOT_FETCH_FROM_GHOST is active. This is likely because Ghost is not available for this environment.'
    );
    return [];
  }

  if (process.env.DEVONLY_SLIICE_ONLY_ONE_POSTS) {
    options.limit = 1;
  }

  while (currPage && currPage <= lastPage) {
    const ghostRes = await ghostAPI[endpoint]
      .browse({
        ...options,
        page: currPage
      })
      .catch(err => {
        console.error(err);
      });

    lastPage = ghostRes.meta.pagination.pages;
    if (ghostRes.length > 0)
      console.log(
        `Fetched Ghost ${endpoint} page ${currPage} of ${lastPage}...and using ${process.memoryUsage.rss() / 1024 / 1024} MB of memory`
      );
    currPage = ghostRes.meta.pagination.next;

    ghostRes.forEach(obj => data.push(obj));
    await wait(200);

    if (process.env.DEVONLY_SLIICE_ONLY_ONE_POSTS) break;
  }

  return data;
};

module.exports = fetchFromGhost;
