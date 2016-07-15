(function() {

  console.log('Yo Buddy! Welcome to the sliding puzzle game');

  // grid size of the puzzle
  const size = 2;

  const randomComplexity = 5;
  const randomizationTimeout = 200;

  // puzzle object
  const puzzle = $('#puzzle');

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

    // create an html object
    const tile = $($.parseHTML('<div class="tile" data-id="' + tileId + '" id="tile' + tileId + '">' + tileId + '</div>'));

    // get tile position
    const y = parseInt(tileId / size);
    const x = tileId % size;

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

    // get the tile which has been clicked
    const tileId = e.target.id;
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

    let oldNeighbour, temp;
    for (var i = 0; i < randomComplexity; i++) {
      setTimeout(() => {
        let neighbours = fetchNeighbours();
        let swapWith = 'tile' + getRandomInt(neighbours);
        if (swapWith === oldNeighbour) {
          neighbours = fetchNeighbours();
          swapWith = 'tile' + getRandomInt(neighbours);
        }
        oldNeighbour = temp;
        temp = swapWith;
        swap(swapWith);
      }, (i * randomizationTimeout))
    }
  }

  randomize();

  $('.button').on('click', randomize);

})()
