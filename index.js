const URL = "https://twitter-clone-by-keerthi.herokuapp.com/tweets";

let nextPageUrl = null;

const onNextPage = () => {
  if (nextPageUrl) {
    getTwitterData(true);
  }
}


const getTwitterData = (nextPage=false)=> {
    const query = document.getElementById("user-search-input").value;
    if (!query) {
        return;
    }
    const encodedQuery = encodeURIComponent(query)
    let fullUrl = `${URL}?q=${encodedQuery}&count=50`;
    if (nextPage && nextPageUrl) {
      fullUrl = nextPageUrl;
    }
    fetch(fullUrl).then((response) => {
        return response.json();
    }).then((data) => {
        buildTweets(data.statuses, nextPage);
        saveNextPage(data.search_metadata);
        nextPageButtonVisibility(data.search_metadata);
    })
}

const enterSearch = (event) => {
    if (event.key === "Enter") {
        getTwitterData();
    }
}


const saveNextPage = (metadata) => {
  if (metadata.next_results) {
    nextPageUrl = `${URL}${metadata.next_results}`
  }else {
    nextPageUrl = null;
  }
}


const selectTrend = (e) => {
  const text = e.innerText;
  document.getElementById('user-search-input').value = text;
  getTwitterData();
}


const nextPageButtonVisibility = (metadata) => {
  if (metadata.next_results) {
    document.querySelector(".next-page-container").style.visibility = "visible";
  } else {
    document.querySelector(".next-page-container").style.visibility = "hidden";
  }
}


const buildTweets = (tweets, nextPage) => {
    let twitterContent = "";
    tweets.map((tweet) => {
        const createdDate = moment(tweet.created_at).fromNow();
        twitterContent += `
        <div class="tweet-container">
            <div class="tweet-user-info">
              <div class="tweet-user-profile" style="background-image: url(${tweet.user.profile_image_url_https})"></div>
              <div class="tweet-user-name-container">
                <div class="tweet-user-fullname">
                  ${tweet.user.name}
                </div>
                <div class="tweet-user-username">
                  @${tweet.user.screen_name}
                </div>
              </div>
            </div>
            `
            if(tweet.extended_entities && tweet.extended_entities.media.length > 0) {
              twitterContent += buildImages(tweet.extended_entities.media);
              twitterContent += buildVideo(tweet.extended_entities.media);
            }
            twitterContent += `
            <div class="tweet-text-container">
              ${tweet.full_text}
            </div>
            <div class="tweet-date-container">${createdDate}</div>
          </div>`
    })

    if (nextPage) {
      document.querySelector(".tweets-list").insertAdjacentHTML("beforeend",twitterContent);
    }else {
      document.querySelector(".tweets-list").innerHTML = twitterContent;
    }
}


const buildImages = (mediaList) => {
  let imagesContent = `<div class="tweet-images-container">`;
  let imageExists = false;
  mediaList.map((media) => {
    if (media.type == "photo") {
      imageExists = true;
      imagesContent += `<div class="tweet-image" style="background-image: url(${media.media_url_https})"></div>`
    }
  });
  imagesContent += `</div>`;
  return imageExists ? imagesContent : '';
}


const buildVideo = (mediaList) => {
  let videoContent = `<div class="tweet-videos-container">`;
  let videoExists = false;
  mediaList.map((media) => {
    if (media.type == "video") {
      videoExists = true;
      const videoVarient = media.video_info.variants.find((varient) => varient.content_type == 'video/mp4')
      videoContent += `
              <video controls>
                <source src="${videoVarient.url}" type="video/mp4">
              </video>
              `
    } else if (media.type == "animated_gif") {
      videoExists = true;
      const videoVarient = media.video_info.variants.find((varient) => varient.content_type == 'video/mp4')
      videoContent += `
              <video loop autoplay>
              <source src="${videoVarient.url}" type="video/mp4">
              </video>
              `
    }
  });
  videoContent += `</div>`;
  return videoExists ? videoContent : '';
}
