function VideoToggle(origVideo, tranVideo, origVideoLink, tranVideoLink) {
    var vid = document.getElementById("videoToggle");
    var vidToggle = document.getElementById('videoToggleButton');
	var currentlyPlaying = 1;
	var vidPlayingTime;
    this.origVideo = origVideo;
    this.tranVideo = tranVideo;
    this.origVideoLink = origVideoLink;
    this.tranVideoLink = tranVideoLink;
	vid.src = origVideo;
	// Switch between original and transformed videos
	vidToggle.onclick = () => {
		vidPlayingTime = vid.currentTime;
		if (currentlyPlaying === 1) {
			vid.src = this.tranVideo;
			currentlyPlaying = 2;
			this.origVideoLink.className = 'unselectedImage';
			this.tranVideoLink.className = 'selectedImage';
		} else {
			vid.src = this.origVideo;
			currentlyPlaying = 1;
			this.tranVideoLink.className = 'unselectedImage';
			this.origVideoLink.className = 'selectedImage';
		}
		vid.load();
	}
	// Set same play time when switched
	vid.onloadedmetadata = () => {
		if(vidPlayingTime !== undefined) {
			vid.currentTime = vidPlayingTime;
		}
	}
}