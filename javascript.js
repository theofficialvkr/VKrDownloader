/*******************************
 * Configuration for Colors
 *******************************/
const formatColors = {
    greenFormats: ["17", "18", "22"],
    blueFormats: ["139", "140", "141", "249", "250", "251", "599", "600"],
    defaultColor: "#9e0cf2"
};

/*******************************
 * Utility Functions
 *******************************/

function getBackgroundColor(downloadUrlItag) {
    if (formatColors.greenFormats.includes(downloadUrlItag)) {
        return "green";
    } else if (formatColors.blueFormats.includes(downloadUrlItag)) {
        return "#3800ff";
    } else {
        return formatColors.defaultColor;
    }
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getYouTubeVideoIds(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const urlObj = new URL(url);
        const validHosts = ['www.youtube.com', 'youtube.com', 'youtu.be'];
        if (!validHosts.includes(urlObj.hostname)) return null;

        if (urlObj.hostname === 'youtu.be') {
            const videoId = urlObj.pathname.slice(1);
            return videoId.length === 11 ? videoId : null;
        }

        if (urlObj.pathname.startsWith('/shorts/')) {
            return urlObj.pathname.split('/')[2];
        }

        const videoId = urlObj.searchParams.get('v');
        return videoId && videoId.length === 11 ? videoId : null;
    } catch (error) {
        return null;
    }
}

function sanitizeContent(content) {
    return DOMPurify.sanitize(content);
}

function updateElement(elementId, content) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = content;
    }
}

function getParameterByName(name, url) {
    name = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`);
    const results = regex.exec(url);
    return !results || !results[2] ? '' : decodeURIComponent(results[2].replace(/\+/g, ' '));
}

async function isValidMediaURL(url) {
    try {
        const resp = await fetch(url, { method: 'HEAD' });
        const type = resp.headers.get("Content-Type") || "";
        return type.startsWith("video/") || type.startsWith("audio/");
    } catch (e) {
        console.warn("HEAD request failed for:", url);
        return false;
    }
}

function makeRequest(inputUrl, retries = 4) {
    const requestUrl = `https://vkrdownloader.xyz/server?api_key=vkrdownloader&vkr=${encodeURIComponent(inputUrl)}`;
    const retryDelay = 2000;
    const maxRetries = retries;

    $.ajax({
        url: requestUrl,
        type: "GET",
        cache: true,
        async: true,
        crossDomain: true,
        dataType: 'json',
        timeout: 15000,
        success: function (data) {
            handleSuccessResponse(data, inputUrl);
        },
        error: function (xhr, status, error) {
            if (retries > 0) {
                let delay = retryDelay * Math.pow(2, maxRetries - retries);
                setTimeout(() => makeRequest(inputUrl, retries - 1), delay);
            } else {
                displayError("Unable to fetch the download link after several attempts. Please check the URL or try again later.");
                document.getElementById("loading").style.display = "none";
            }
        },
        complete: function () {
            document.getElementById("downloadBtn").disabled = false;
        }
    });
}

function displayError(message) {
    const errorContainer = document.getElementById("error");
    if (errorContainer) {
        errorContainer.innerHTML = sanitizeContent(message);
        errorContainer.style.display = "block";
    } else {
        alert(message);
    }
}

document.getElementById("downloadBtn").addEventListener("click", debounce(function () {
    document.getElementById("loading").style.display = "initial";
    document.getElementById("downloadBtn").disabled = true;

    const inputUrl = document.getElementById("inputUrl").value.trim();
    if (!inputUrl) {
        displayError("Please enter a valid YouTube URL.");
        document.getElementById("loading").style.display = "none";
        document.getElementById("downloadBtn").disabled = false;
        return;
    }

    makeRequest(inputUrl);
}, 300));

function handleSuccessResponse(data, inputUrl) {
    document.getElementById("container").style.display = "block";
    document.getElementById("loading").style.display = "none";

    if (data.data) {
        const videoData = data.data;
        const downloadUrls = videoData.downloads.map(d => d.url);
        const videoSource = videoData.source;
        const videoId = getYouTubeVideoIds(videoSource);
        const thumbnailUrl = videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : videoData.thumbnail;

        const videoHtml = `
            <video style='background: black url(${thumbnailUrl}) center center/cover no-repeat; width:100%; height:500px; border-radius:20px;' 
                poster='${thumbnailUrl}' controls playsinline>
                ${downloadUrls.map(url => `<source src='${url}' type='video/mp4'>`).join('')}
            </video>`;

        updateElement("thumb", videoHtml);
        updateElement("title", videoData.title ? `<h3>${sanitizeContent(videoData.title)}</h3>` : "");
        updateElement("description", videoData.description ? `<h4><details><summary>View Description</summary>${sanitizeContent(videoData.description)}</details></h4>` : "");
        updateElement("duration", videoData.size ? `<h5>${sanitizeContent(videoData.size)}</h5>` : "");

        generateDownloadButtons(data, inputUrl);
    } else {
        displayError("Unable to retrieve download link. Please check the URL or try again later.");
    }
}

async function generateDownloadButtons(videoData, inputUrl) {
    const downloadContainer = document.getElementById("download");
    downloadContainer.innerHTML = "";

    if (videoData.data) {
        const downloads = videoData.data.downloads;
        const videoSource = videoData.data.source;
        const videoId = getYouTubeVideoIds(videoSource);

        if (videoId) {
            const qualities = ["mp3", "360", "720", "1080"];
            qualities.forEach(quality => {
                downloadContainer.innerHTML += `
                    <iframe style="border:0;display:inline;min-width:150px;height:45px;margin-top:10px;overflow:hidden;"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-downloads" scrolling="no"
                        src="https://vkrdownloader.xyz/server/dlbtn.php?q=${encodeURIComponent(quality)}&vkr=${encodeURIComponent(videoSource)}">
                    </iframe>`;
            });
        }

        for (const download of downloads) {
            if (download && download.url) {
                const downloadUrl = download.url;
                const isValid = await isValidMediaURL(downloadUrl);
                if (!isValid) continue;

                const itag = getParameterByName("itag", downloadUrl);
                const bgColor = getBackgroundColor(itag);
                const videoExt = download.format_id;
                const videoSize = download.size;

                downloadContainer.innerHTML += `
                    <a href='${downloadUrl}' download target='_blank' rel='noopener noreferrer'>
                        <button class='dlbtns' style='background:${bgColor}'>
                            ${sanitizeContent(videoExt)} - ${sanitizeContent(videoSize)}
                        </button>
                    </a>`;
            }
        }
    }

    if (downloadContainer.innerHTML.trim() === "") {
        displayError("No valid download links found. Try refreshing the page or using a different link.");
        document.getElementById("container").style.display = "none";
    }
}
