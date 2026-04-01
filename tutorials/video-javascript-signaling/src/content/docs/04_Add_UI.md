---
title: Add UI
description: The HTML structure of the application
---

Now let's add some structure to your video and chat application.

Copy this HTML code in the `body` section of `index.html` file in the `public` folder (`<!-- ⌄⌄⌄ Add HTML ⌄⌄⌄ -->`):

```html
    <div id="videos">
        <div id="subscriber"></div>
        <div id="publisher"></div>
    </div>

    <div id="textchat">
         <p id="history"></p>
         <form>
              <input type="text" placeholder="Input your text here" id="msgTxt"></input>
         </form>
    </div>
```

- `videos` is the container element of the video application
- `subscriber` is where the other video participant will appear
- `publisher` is where your camera's video will show up
- `textchat` is the container where the chat will appear
- `history` is where chat messages will appear
- `msgTxt` is where you type your chat message
