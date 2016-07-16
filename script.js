(function() {

  console.log('Yo Buddy! Welcome to the sliding puzzle game');

  let busyFlag = false;

  let randomizeQueue, timeout;

  const input = $('#file-input');
  let ctx, img;

  input.on('change', function(e) {

    var file = e.target.files[0];
    var fr = new FileReader();

    fr.onload = function(e) {
      img = new Image();
      img.onload = function(e) {

        canvas.width = img.width;      // set canvas size big enough for the image
        canvas.height = img.height;
        ctx = canvas.getContext("2d");
        setTimeout(() => {

          ctx.drawImage(img,0,0);         // draw the image
        }, 0)
      };
      img.src = fr.result;
    }

    fr.readAsDataURL(file);
  })


  function gameInit() {

    // let the games begin

    if (!$('#file-input')[0].files.length) return;

    $('.init-box').hide();
    $('#reset').show();

    // get the user's difficulty level
    const difficulty = Number($('#difficulty').val());

    // grid size of the puzzle
    const size = difficulty;

    // set some complexity of the randomization
    const randomComplexity = size * (5 + size);
    const randomizationTimeout = 200 + 10;

    // set puzzle dimensions
    const body = $('body');
    const bodyHeight = body.innerHeight();
    const bodyWidth = body.innerWidth();

    // set it to 60% of the browser window size
    const puzzleDimension = Math.min(bodyHeight, bodyWidth) * 0.6;

    // puzzle object
    const puzzle = $('#puzzle');

    puzzle.css({ height: puzzleDimension, width: puzzleDimension });

    // make the tiles index
    const tiles = [], lastTileId = (size * size) - 1;
    for (var i = 0; i <= lastTileId; i++) {
      tiles.push(i);
    }

    let blankTileId = size * size - 1;

    // get size of each tile
    const tileDimension = (puzzle.innerHeight())/size;  // the 2 at the end is just for laziness purposes to cut off the bad styling :p

    // create the tile elements

    const tileElements = tiles.map(tileId => {

      // get tile position
      const y = parseInt(tileId / size);
      const x = tileId % size;

      const startX = parseInt(document.getElementById('canvas').width/size) * x;
      const startY = parseInt(document.getElementById('canvas').height/size) * y;

      const endX = parseInt(document.getElementById('canvas').width/size) * (x + 1);
      const endY = parseInt(document.getElementById('canvas').height/size) * (y + 1);

      var imgData = ctx.getImageData(startX, startY, endX, endY);

      var canvasTemp = document.createElement('canvas'),
      ctxTemp = canvasTemp.getContext('2d');

      canvasTemp.width = endX - startX;
      canvasTemp.height = endY - startY;

      // create imageData object
      var idata = ctxTemp.createImageData(imgData.width, imgData.height);

      // set our buffer as source
      idata.data.set(imgData.data);

      // update canvas with new data
      ctxTemp.putImageData(idata, 0, 0);
      var dataUri = canvasTemp.toDataURL();


      // create an html object
      const tile = $($.parseHTML('<div class="tile" data-id="' + tileId + '" id="tile' + tileId + '"><img class="tile-img" src="' + dataUri + '"/></div>'));

      tile.data('x', x);
      tile.data('y', y);

      // calculate positions
      const left = x * tileDimension;
      const top = y * tileDimension;

      // set the size of the tiles
      tile.css({ height: tileDimension, width: tileDimension, top: top, left: left });

      if (tileId === blankTileId) {
        // set blank tile as blank, apparantly
        tile.css({ background: 'white', 'z-index': 0 });
        tile.find('.tile-img').css('visibility', 'hidden');
      }

      return tile;
    });

    // put them in the DOM
    puzzle.append(tileElements);

    function checkOrder() {
      const tiles = $('.tile');
      const faultArray = [];
      $.each(tiles, function(idx, el) {
        if ($(el).data('id') != $(el).attr('id').replace('tile', '')) faultArray.push(this);
      });

      if (faultArray.length === 0) setTimeout(() => {
        $('#tile' + blankTileId).find('.tile-img').css('visibility', 'visible');
        alert('hurry you won!')
      }, randomizationTimeout);
    }

    function swap(tileId, checkOrderFlag) {
      // get the tile which has been clicked
      const tile = $('#'+tileId);

      // get tile's placement
      const x = tile.data('x');
      const y = tile.data('y');

      // get blankTile
      const blankTile = $('#tile' + blankTileId);

      // get blank tile's placement
      const blankTileX = blankTile.data('x');
      const blankTileY = blankTile.data('y');

      // console.log('old => ', blankTileX, blankTileY);

      // get tile's new positions
      const newTileX = blankTileX;
      const newTileY = blankTileY;

      // get tile's new absolute positions
      const newTileTop = newTileX * tileDimension;
      const newTileLeft = newTileY * tileDimension;

      // get blank tile's new positions
      const newBlankTileX = x;
      const newBlankTileY = y;

      // get blank tile's new absolute positions
      const newBlankTileTop = newBlankTileX * tileDimension;
      const newBlankTileLeft = newBlankTileY * tileDimension;

      // wait for the brower to get it's hands free
      requestAnimationFrame(() => {

        // set positions for tile
        tile.css({ left: newTileTop, top: newTileLeft });
        tile.data('x', newTileX);
        tile.data('y', newTileY);
        tile.attr('id', 'tile' + blankTileId);

        // set positions for the blank tile
        blankTile.css({ left: newBlankTileTop, top: newBlankTileLeft });
        blankTile.data('x', newBlankTileX);
        blankTile.data('y', newBlankTileY);
        blankTile.attr('id', tileId);

        blankTileId = tileId.replace('tile', '');

        if (checkOrderFlag) checkOrder();
      })
    }


    $('#puzzle').on('click', '.tile', e => {

      if (busyFlag) return;

      // get the tile which has been clicked
      const tileId = $(e.target).parent().attr('id');
      const tile = $('#'+tileId);

      // get tile's placement
      const x = tile.data('x');
      const y = tile.data('y');

      // get blankTile
      const blankTile = $('#tile' + blankTileId);

      // get blank tile's placement
      const blankTileX = blankTile.data('x');
      const blankTileY = blankTile.data('y');

      if (Math.abs(x - blankTileX) === 1 && Math.abs(y - blankTileY) === 0 || Math.abs(x - blankTileX) === 0 && Math.abs(y - blankTileY) === 1) {
        swap(tileId, true);
      }

    })

    function ArrNoDupe(a) {
      var temp = {};
      for (var i = 0; i < a.length; i++)
      temp[a[i]] = true;
      var r = [];
      for (var k in temp)
      r.push(k);
      return r;
    }

    function fetchNeighbours() {
      const blankTile = $('#tile' + blankTileId);

      const x = blankTile.data('x');
      const y = blankTile.data('y');

      const neighbours = [];

      if ( (x > 0 && x <= (size - 1)) && (y > 0 && y <= (size - 1)) ) {
        // right bottom
        neighbours.push((y - 1) * size + x); // up
        neighbours.push(y * size + (x - 1)); // left
      }
      if ( (x >= 0 && x < (size - 1)) && (y >= 0 && y < (size - 1)) ) {
        // left top
        neighbours.push((y + 1) * size + x); // bottom
        neighbours.push(y * size + (x + 1)); // right
      }
      if ( (x > 0 && x <= (size - 1)) && (y >= 0 && y < (size - 1)) ) {
        // right top
        neighbours.push(y * size + (x - 1)); // left
        neighbours.push((y + 1) * size + x); // bottom
      }
      if ( (x >= 0 && x < (size - 1)) && (y > 0 && y <= (size - 1)) ) {
        // left bottom
        neighbours.push((y - 1) * size + x); // up
        neighbours.push(y * size + (x + 1)) // right
      }
      return ArrNoDupe(neighbours);
    }

    function getRandomInt(array) {
      const min = 0, max = (array.length - 1);
      return array[Math.floor(Math.random() * (max - min + 1)) + min];
    }


    function randomize() {

      // these two people are references of the last two moves so that they are not repeated
      let oldNeighbour, temp;

      // choose a random swappable neighbour for the selected number of times

      busyFlag = true;

      // set interval for the random swaps
      randomizeQueue = setInterval(function() {

        // find the neighbours
        let neighbours = fetchNeighbours();
        let swapWith = 'tile' + getRandomInt(neighbours);

        // if it is repeating then choose again
        if (swapWith === oldNeighbour) {
          neighbours = fetchNeighbours();
          swapWith = 'tile' + getRandomInt(neighbours);
        }

        // set the oldNeighbour to the current one
        oldNeighbour = temp;
        temp = swapWith;

        // make the swap
        swap(swapWith);

      }, (randomizationTimeout + 10));

      // stop the interval on time
      timeout = setTimeout(() => {
        clearInterval(randomizeQueue);
        busyFlag = false;
      }, ((randomizationTimeout + 10 ) * randomComplexity ));
    }

    randomize();

  }

  function gameReset() {

    clearInterval(randomizeQueue);
    clearTimeout(timeout);
    busyFlag = false;

    $('#puzzle').html('');
    $('.init-box').show();
    $('#reset').hide();
  }

  $('#start').on('click', gameInit);
  $('#reset').on('click', gameReset);

})()
