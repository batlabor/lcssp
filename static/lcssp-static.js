/******************************
 * LCSSP ELEMENTS
 *****************************/
const playground = document.getElementById('pl');
const editorParent = document.querySelector('.grid-item.editor');
const lessContainer = document.getElementById('containerLess');
const cssContainer = document.getElementById('containerCss');
let mediaquery;

const vl = function () {
  return 14;
};

/******************************
 * CREATE EDITORS
 *****************************/

// Create instancs container
monaco.editors = {};
// LESS
monaco.editors.less = monaco.editor.create(lessContainer, {
  value: [''].join('\n'),
  theme: 'vs-dark',
  language: 'less',
  fontSize: vl(),
  minimap: { maxColumn: 48, renderCharacters: false, autohide: true },
});
//CSS
monaco.editors.css = monaco.editor.create(cssContainer, {
  readOnly: true,
  value: [''].join('\n'),
  language: 'css',
  fontSize: vl(),
  minimap: { maxColumn: 48, renderCharacters: false },
});

/******************************
 * COMPILLING CSS
 *****************************/

window.LessEditorError = null;
window.LessEditorData = null;

monaco.editors.less.onDidChangeModelDecorations(function () {
  LessEditorError = monaco.editor.getModelMarkers(
    monaco.editors.less.getModel()
  ).length;
});

//rendering
monaco.editors.less.onDidChangeModelContent(function () {
  let data = monaco.editors.less.getValue();
  setTimeout(function () {
    //only if no syntax error in .less
    if (LessEditorError == 0 && LessEditorData != data) {
      less.render(data).then(
        function (output) {
          monaco.editors.css.setValue(output.css);
          badge.setAttribute('class', 'hidden');
        },
        function (error) {
          badge.removeAttribute('class');
          console.log(error);
        }
      );
    } else {
      badge.removeAttribute('class');
    }
  }, 1000);
});

/******************************
 * SET DEFAULT VALUE
 *****************************/
let valueTest = `/***************************************************
  Welcome to Less CSS Playground!

  You can write any "less css" syntax here and see the
  compiled css in the second window.
  
  More info: https://lesscss.org/

  This editor is a Monaco Editor, more info here:
  https://microsoft.github.io/monaco-editor/

 ***************************************************/
  
  // A generic example of using a recursive loop 
  // to generate CSS grid classes
  
  .generate-columns(4);

  .generate-columns(@n, @i: 1) when (@i =< @n) {
    .column-@{i} {
      width: (@i * 100% / @n);
    }
    .generate-columns(@n, (@i + 1));
  }
`;

monaco.editors.less.onDidCompositionEnd(
  monaco.editors.less.setValue(valueTest)
);

/******************************
 * RESIZE EDITORS
 *****************************/
const monacoResizer = function () {
  let controlElement = editorParent;
  let editorsContainersArray = [lessContainer, cssContainer];
  // Set dimension
  let dimension = controlElement.getBoundingClientRect();
  editorsContainersArray.forEach((el) => {
    el.setAttribute(
      'style',
      'width: ' + dimension.width + 'px; height:' + dimension.height + 'px;'
    );
  });
  if (monaco.editors) {
    // Repaint editors
    monaco.editors.less.layout();
    monaco.editors.css.layout();
  }
  let mq = getComputedStyle(document.body).getPropertyValue('--mediaquery');
  mediaquery = mq.slice(1, -1);
};

window.addEventListener('resize', function (event) {
  monacoResizer();
});

monacoResizer();

/******************************
 * SWITCH THEME
 *****************************/
const switchTheme = function () {
  if (monaco.editors.less._themeService.getColorTheme().id == 'vs-dark') {
    monaco.editor.setTheme('vs-light');
    playground.classList.add('light');
  } else {
    monaco.editor.setTheme('vs-dark');
    playground.classList.remove('light');
  }
};

/******************************
 * DOWNLOAD FILE
 *****************************/
const rawDownload = function (type) {
  let mime, filename, data, file;
  mime = 'plain/text';
  if (type === 'less') {
    filename = 'playground.less';
    data = monaco.editors.less.getValue();
  } else {
    filename = 'playground.css';
    data = monaco.editors.css.getValue();
  }
  file = new File(['\ufeff' + data], filename, {
    type: mime + ':charset=UTF-8',
  });
  let url = URL.createObjectURL(file);
  window.open(url, '_blank');
  URL.revokeObjectURL(url);
};
/******************************
 * LOAD EXTERNAL .less file into editor
 *****************************/
const fileSelect = function (file) {
  const selectedFile = file.files[0];
  if (selectedFile) {
    const reader = new FileReader();
    reader.addEventListener(
      'load',
      () => {
        monaco.editors.less.setValue(reader.result);
      },
      false
    );
    if (file) {
      reader.readAsText(selectedFile);
    }
  }
};
//block file select in mobile css view
LessFile.addEventListener('click', function (event) {
  if (mediaquery != 'desktop' && playground.classList.contains('mobile-css')) {
    event.preventDefault();
    console.log('block');
  }
});

document
  .querySelector('.grid-item.head.css')
  .addEventListener('click', function (event) {
    if (mediaquery != 'desktop') {
      playground.classList.toggle('mobile-css');
      monaco.editors.css.layout();
      event.preventDefault();
    }
  });

document
  .querySelector('.grid-item.head.less')
  .addEventListener('click', function (event) {
    if (
      mediaquery != 'desktop' &&
      playground.classList.contains('mobile-css')
    ) {
      playground.classList.toggle('mobile-css');
      monaco.editors.css.layout();
      event.preventDefault();
    }
  });
