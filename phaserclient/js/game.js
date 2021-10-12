function viewport()
{
var e = window
, a = 'inner';
if ( !( 'innerWidth' in window ) )
{
a = 'client';
e = document.documentElement || document.body;
}
return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

    var config = {
        type: Phaser.AUTO,
        width: viewport().width-10,
        height: viewport().height-10,
        scene: {
            preload: preload,
            create: create
        },
        backgroundColor: "#FFFFFF"
    };

    var game = new Phaser.Game(config);

    function preload ()
    {
    }

    function create ()
    {

    }