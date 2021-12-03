// @ts-nocheck
const VoxeetSDK = window.VoxeetSDK
const mediaDevice =VoxeetSDK.mediaDevice
const consumerKey = 'CLAObZ9xUp3FL2GkddfCRg==';
const consumerSecret = 'C24dF1nban0JYb19xN7siqoxQVArP3Mt_APGvug4YkM=';

const init = ()=>{
    VoxeetSDK.initialize(consumerKey, consumerSecret);
}

const createSession = (name)=>{
    return new Promise((resolve, reject) => {
        VoxeetSDK.session.open({
             name: name 
            }).then((cellConference) => {
                resolve(cellConference);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
    }); 
}

/**
 * This function either creates a new session if there isn't anyone in one with that alias
 * or finds the conference if there already is.
 * It returns an object that can be passed into joinConference below();
 * @param {*} alias
 * @returns conference
 */
const createConference = (alias) => {
    return new Promise((resolve, reject) => {
        VoxeetSDK.conference
            .create({
                alias,
                params: {
                    dolbyVoice: true
                }
            })
            .then((cellConference) => {
                resolve(cellConference);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
    });
};

// conference in/out
const joinConference = (conf) => {
    return new Promise((resolve, reject) => {
        VoxeetSDK.conference
            .join(conf, {
                preferRecvMono: false,
                spatialAudio: true
            })
            .then((conf) => {
                resolve(conf);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
    });
};

const leaveConference = () => {
    VoxeetSDK.conference.leave();
};

// video
const startVideo = () => {
    return new Promise((resolve, reject) => {
        VoxeetSDK.conference
            .startVideo(VoxeetSDK.session.participant)
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                console.error(err);
            });
    });
};

const stopVideo = () => {
    VoxeetSDK.conference
        .stopVideo(VoxeetSDK.session.participant)
        .then(() => {})
        .catch((err) => {
            console.error(err);
        });
};

// audio
const startAudio = () => {
    VoxeetSDK.conference
        .startAudio(VoxeetSDK.session.participant)
        .then(() => {})
        .catch((err) => {
            console.error(err);
        });
};

const stopAudio = () => {
    VoxeetSDK.conference
        .stopAudio(VoxeetSDK.session.participant)
        .then(() => {})
        .catch((err) => {
            console.error(err);
        });
};

// media devices
const getAudioDevices = () => {
    return new Promise((resolve, reject) => {
        mediaDevice
            .enumerateAudioDevices()
            .then((value) => {
                resolve(value);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const getVideoDevices = () => {
    return new Promise((resolve, reject) => {
        mediaDevice
            .enumerateVideoDevices()
            .then((value) => {
                resolve(value);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

const changeAudioDevice = (deviceId) => {
    mediaDevice
        .selectAudioInput(deviceId)
        .then(() => {})
        .catch((err) => console.error);
};

const changeVideoDevice = (deviceId) => {
    mediaDevice
        .selectVideoInput(deviceId)
        .then(() => {})
        .catch((err) => console.error);
};

export {
    VoxeetSDK,
    init,
    createSession,
    createConference,
    joinConference,
    leaveConference,
    startVideo,
    stopVideo,
    startAudio,
    stopAudio,
    getAudioDevices,
    getVideoDevices,
    changeAudioDevice,
    changeVideoDevice,
};