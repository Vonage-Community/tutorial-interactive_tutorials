import { defineToolbarApp } from 'astro/toolbar';

let tutorial: {
  title: string;
  slug: string;
  files: string[];
  panels: string[];
  version: string;
} = {
  title: '',
  slug: '',
  files: [],
  panels: [],
  version: '',
};

export default defineToolbarApp({
  init(canvas, app, server) {
    const myWindow = document.createElement('astro-dev-toolbar-window');

    const myContent = document.createElement('div');
    myContent.innerHTML = `
    <details name='steps' open>
      <summary>Step 1: Enter title</summary>
      <input id='title' placeholder='Enter tutorial title'/>
    </details>
    <details name='steps'>
      <summary>Step 2: Select panels needed</summary>
      Please select other panels used in the tutorial
      <form id='panels'>
        <div>
          <input type="checkbox" id="terminal" name="panels" value="terminal" />
          <label for="terminal">Terminal</label>
        </div>
        <div>
          <input type="checkbox" id="browser" name="panels" value="browser" />
          <label for="browser">Browser</label>
        </div>
      </form>
    </details>
    <details name='steps'>
      <summary>Step 3: Create steps</summary>
      In the src -> content -> docs folder, please add the steps for the tutorial
      <br><br>See <a href='https://conshus.github.io/onboarding-tutorials/toolbar-app/' target='blank' style='color: white'>Reference</a> for components you can add.<br><br>
    </details>
    <details name='steps'>
      <summary>Step 4: Set Files needed</summary>
      Please enter the names and file type of the files needed for the tutorial one at a time.
      <input id='file-input' placeholder='ex. index.html'/><button id="add-file">add</button>
      <strong id='file-input-error'>please include filename AND filetype</strong>
      <br/>File list:
      <ul id='file-list'></ul>
    </details>
    <details name='steps'>
      <summary>Step 5: Finish up</summary>
      Click to start generating the tutorial: <button id="generate">generate</button>
      <p id="status"></p>
      <span id="complete">
        <a href="" id="download-link" target="_blank">Click to download</a>
        <br/>Then unzip the file and upload the folder to the GitHub repository.
      </span>
    </details>
    `;
    // use appendChild directly on `window`, not `myWindow.shadowRoot`
    myWindow.appendChild(myContent);

    canvas.append(myWindow);

    const astroToolbarWindow = canvas.querySelector('astro-dev-toolbar-window');

    if (localStorage.getItem('tutorial')) {
      tutorial = JSON.parse(localStorage.getItem('tutorial') || '{}');
      refreshFilesList();
      if (tutorial.panels.length !== 0) {
        tutorial.panels.forEach((panel) => {
          (
            astroToolbarWindow?.querySelector(`#${panel}`) as HTMLInputElement
          ).checked = true;
        });
      }
    }

    const completeSpan = astroToolbarWindow?.querySelector(
      '#complete'
    ) as HTMLSpanElement;

    completeSpan.style.display = 'none';

    const panelsForm = astroToolbarWindow?.querySelector('#panels');

    panelsForm?.addEventListener('change', (event) => {
      tutorial.panels = [];
      const panelsChecked = astroToolbarWindow?.querySelectorAll(
        'input[type="checkbox"][name="panels"]:checked'
      );
      panelsChecked?.forEach((panel) => {
        tutorial.panels.push(panel.id);
      });
      saveTutorial();
    });

    function saveTutorial() {
      localStorage.setItem('tutorial', JSON.stringify(tutorial));
    }

    function refreshFilesList() {
      const fileUl = astroToolbarWindow?.querySelector(
        '#file-list'
      ) as HTMLButtonElement;
      fileUl.innerHTML = '';
      tutorial.files = Array.from(new Set(tutorial.files));
      tutorial.files.forEach((file) => {
        const fileLi = document.createElement('li');
        fileLi.id = file;
        fileLi.innerText = file + ' ';
        fileLi.classList.add('file');
        const fileButton = document.createElement('button');
        fileButton.dataset.id = file;
        fileButton.innerText = 'delete';
        fileButton.addEventListener('click', (event) => {
          tutorial.files.splice(
            tutorial.files.indexOf((event.target as HTMLElement).dataset.id),
            1
          );
          refreshFilesList();
        });
        fileLi.appendChild(fileButton);
        fileUl.appendChild(fileLi);
      });
      saveTutorial();
    }

    const titleInput = astroToolbarWindow?.querySelector(
      '#title'
    ) as HTMLInputElement;
    titleInput.value = tutorial.title !== '' ? tutorial.title : '';
    titleInput?.addEventListener('change', (event) => {
      tutorial.title = titleInput?.value;
      tutorial.slug = titleInput?.value.replaceAll(' ', '-').toLowerCase();
      saveTutorial();
    });

    const fileInputError = astroToolbarWindow?.querySelector(
      '#file-input-error'
    ) as HTMLElement;

    fileInputError.style.display = 'none';

    astroToolbarWindow
      ?.querySelector('#add-file')
      ?.addEventListener('click', (event) => {
        fileInputError.style.display = 'none';
        const fileInput = astroToolbarWindow?.querySelector(
          '#file-input'
        ) as HTMLInputElement;
        // make sure has extension
        if (fileInput.value.includes('.')) {
          tutorial.files = [...tutorial.files, fileInput.value];
          fileInput.value = '';
          refreshFilesList();
        } else {
          fileInputError.style.display = 'block';
        }
      });

    const generateButton = astroToolbarWindow?.querySelector(
      '#generate'
    ) as HTMLButtonElement;

    const statusEl = astroToolbarWindow?.querySelector(
      '#status'
    ) as HTMLParagraphElement;

    generateButton?.addEventListener('click', (event) => {
      generateButton.disabled = true;
      statusEl.innerText = '';
      completeSpan.style.display = 'none';
      server.send('my-app:generate', { tutorial });
    });

    server.on('server-status', (data: any) => {
      statusEl.innerText = data.status;
      if (data.status === 'Complete!') {
        astroToolbarWindow?.querySelector('#complete') as HTMLParagraphElement;
        (
          astroToolbarWindow?.querySelector(
            '#download-link'
          ) as HTMLAnchorElement
        ).style = `color: white; background-color: black`;
        (
          astroToolbarWindow?.querySelector(
            '#download-link'
          ) as HTMLAnchorElement
        ).href = `${window.location.origin}/${tutorial.slug}.zip`;
        generateButton.disabled = false;
        completeSpan.style.display = 'block';
      }
    });
  },
});
