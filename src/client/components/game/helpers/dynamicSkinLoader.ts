const failedLoads = {};

const loadImage = (scene: Phaser.Scene, url: string, key: string) => {
    return new Promise((resolve, reject) => {
    if(failedLoads[key]) return resolve(false);
    scene.load.image(key, url);

    scene.load.once(Phaser.Loader.Events.COMPLETE, () => {
        resolve(true);
    });
    scene.load.once(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {
        failedLoads[key] = true;
        resolve(false);
    });

    scene.load.start();
    });
}

const doIt = async (scene: Phaser.Scene, key: string) => {
    // Check if key exists
    if(scene.textures.exists(key)) return true;
    else {
        // Attempt to load the image
        const baseAssetsUrl = '/assets/images/';
        const url = baseAssetsUrl + key + '.png';
        const image = await loadImage(scene, url, key);
        return image;
    }
};

export default async (scene: Phaser.Scene, skin: string) => {
    if(skin == 'player') return {skin: 'player', sword: 'sword'};

    const player = await doIt(scene, skin+'Player');
    const sword = await doIt(scene, skin+'Sword');

    return {skin: player ? skin+'Player' : 'player', sword: sword ? skin+'Sword' : 'sword'};
}