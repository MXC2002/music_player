const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'MXC_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdthumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')
const rangeVolume = $('.range-volume')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem('PLAYER_STORAGE_KEY')) || {},
    songs: [
        {
            name: '[ MEMORY REBOOT (AMBIENT) ] Saitama "Power or Curse" - One Punch Man [AMV/Edit] 4K',
            singer: 'Pandora',
            path: './assets/music/OPM_edit.mp3',
            image: './assets/img/OPM_edit.jpg'
        },
        {
            name: 'This Far (RudeLies Remix) Raven & Kreyn ft. Nino Lucarelli [ AMV 🔥]',
            singer: 'Raven & Kreyn, Nino Lucarelli',
            path: './assets/music/this-far.mp3',
            image: './assets/img/this-far.jpg'
        },
        {
            name: 'Fight',
            singer: 'BeatBrothers · Laser · Jeremy',
            path: './assets/music/fight.mp3',
            image: './assets/img/Fight.jpg'
        },
        {
            name: 'TIRED OF PROBLEMS',
            singer: 'NUEKI x TOLCHONOV x glichery',
            path: './assets/music/Tired-of-problems.mp3',
            image: './assets/img/tired-of-problems.jpg'
        },
        {
            name: 'Beneath The Rain',
            singer: 'Nom',
            path: './assets/music/beneath-the-rain.mp3',
            image: './assets/img/nom.jpg'
        },
        {
            name: 'Jeremy Zucker - comethru',
            singer: 'Jeremy Zucker',
            path: './assets/music/comethru.mp3',
            image: './assets/img/comethru.jpg'
        },
        {
            name: 'who decides your limits ?',
            singer: 'Pandora',
            path: './assets/music/opm_mb.mp3',
            image: './assets/img/opm_mb.jpg'
        },
        {
            name: 'Beneath The Rain',
            singer: 'Nom',
            path: './assets/music/beneath-the-rain.mp3',
            image: './assets/img/nom.jpg'
        },
        {
            name: 'Jeremy Zucker - comethru',
            singer: 'Jeremy Zucker',
            path: './assets/music/comethru.mp3',
            image: './assets/img/comethru.jpg'
        },
        {
            name: 'who decides your limits ?',
            singer: 'Pandora',
            path: './assets/music/opm_mb.mp3',
            image: './assets/img/opm_mb.jpg'
        },


    ],
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem('PLAYER_STORAGE_KEY', JSON.stringify(this.config))
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playList.innerHTML = htmls.join('');
    },

    defineProperty: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            },

        })
    },

    handleEvents: function () {
        const _this = this
        const cdWidth = cd.offsetWidth

        //Xử lý phóng to / thu nhỏ cd
        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop || window.scrollY
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth

        }

        //Xử lý khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        //Khi song được play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing')
            cdThumbAnimate.play();
        }

        //Khi song bị pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing')
            cdThumbAnimate.pause();

        }

        //khi tiến độ song thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        //Xử lý khi tua song
        progress.oninput = function (e) {
            // audio.currentTime = progress.value / 100 * audio.duration
            const seekTime = e.target.value / 100 * audio.duration
            audio.currentTime = seekTime
        }

        //Xử lý CD quay/dừng
        const cdThumbAnimate = cdthumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10 giây
            iterations: Infinity,

        })
        cdThumbAnimate.pause()

        // Khi next song
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong();
            }
            audio.play()
            _this.updatePlayingState();
            _this.scrollToActiveSong();

        }

        // Khi prev song
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong();
            }
            audio.play()
            _this.updatePlayingState();
            _this.scrollToActiveSong();


        }
        
        //Xử lý next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
            _this.updatePlayingState();
            _this.scrollToActiveSong();
        }

        // Xử lý bật / tắt random song
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)

            // Nếu đang ổ chế độ random thì hủy bỏ chế độ repeat
            if (_this.isRandom) {
                _this.isRepeat = false
                _this.setConfig('isRepeat', _this.isRepeat)
                repeatBtn.classList.remove('active')
            }

            _this.updatePlayingState();
            _this.scrollToActiveSong();
        }


        //Xử lý bật / tắt repeat song
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

            // Nếu đang ở chế độ repeat thì hủy bỏ chế độ random
            if (_this.isRepeat) {
                _this.isRandom = false
                _this.setConfig('isRandom', _this.isRandom)
                randomBtn.classList.remove('active')
            }

            _this.updatePlayingState();
            _this.scrollToActiveSong();
        }

        // Lắng nghe hành vi click vào play list
        playList.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)')
            const isOption = e.target.closest('.option')
            if (songNode || isOption) {
                // Xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong();
                    _this.updatePlayingState();
                    _this.scrollToActiveSong();
                    audio.play()
                }

                // Xử lý khi click vào song option
                if (isOption) {
                    
                }
            }
        }

         // Xử lí tăng giảm âm lượng khi trượt thanh range volumn
        rangeVolume.oninput = (e) => {
            const currentVolume = e.target.value / 100

            audio.volume = currentVolume
        } 
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'nearest'
            })
        }, 400)
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name
        cdthumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path


    },

    nextSong: function () {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong();

    },

    prevSong: function () {
        this.currentIndex--
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },

    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong();


    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },

    // Active song trong list khi được phát
    updatePlayingState: function () {
        const songItems = $$('.song')
        songItems.forEach((songItem, index) => {
            if (index === this.currentIndex) {
                songItem.classList.add('active');
            } else {
                songItem.classList.remove('active');
            }
        });
    },

    start: function () {
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        //Định nghĩa các thuộc tính cho Object
        this.defineProperty();

        //Lắng nghe / xử lý các sự kiện DOM events
        this.handleEvents();

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        //Render playlists
        this.render();

        // Hiển thi trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start();
