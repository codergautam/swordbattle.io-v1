# For the judges:

### My idea
I remember a few years ago I was just getting into programming and I was decently good at scratch. I had an idea for a scratch game called sword.io which was basically 2 people 1v1ing with swords. I made the game and it was probably one of my best scratch games. 

![Sword.io Screenshot](https://i.imgur.com/JXlhHOo.png)

Anyway when I saw that Kajam was going to start. I wanted to make an actual online multiplayer version of this game. I was going to use kaboom.js for it. 

### Process

I started with the kaboom template. At first it looked confusing, but I eventually figured it out. I didn't really like the implementation of multiplayer in the template (was annoying to work with like it cleared everything when someone joined), so I quickly botched together a socket.io server with everything I needed. At this point, I had some problems with kaboom, like dynamic resizing didn't work, hitboxes couldn't be calculated correctly, and rotate doesn't work with area collider. I made the very sad decision to switch to another game library. I settled on phaser and that worked much better for me, (even though docs were really annoying sometime)

### Learning
This was my first ever multiplayer game, I had no clue how this stuff works. [This article](https://www.gabrielgambetta.com/client-server-game-architecture.html) really helped me to deal with smooth movement and client side prediction. I learned a lot about `lerp`, sin and cos, and how collisions are calculated. I also learned about Authoritative Servers and Dumb Clients, so it is hard to make hacks for my game.

### Conclusion

Overall, this was an amazing journey for me, thanks Replit Team, for creating this amazing opportunity to learn and do something you love... <3
