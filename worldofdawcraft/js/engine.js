
/* ---------------------> Arrow Game Engine <--------------------- */

$.fn.arrowEngine = function(player, options)
{
    setInterval(function () { update(); }, 10);

    var score = 0;

    var area = this;
    var collisions = [];
    var keyMap =
    { 
    	32: false,
    	37: false,
    	38: false,
    	39: false,
    	40: false,
    	65: false,
    	68: false,
    	83: false,
    	87: false
    };
    var defaults =
    {
    	enableShooting: true,
    	debug: false,
    	fullscreen: true
    };
    var readyToShoot = true;

    var options = $.extend(defaults, options);

    var animateTimeout = [];
    var castTimeout = [];
    var shootTimeout = [];

	var grid = [[]];

	var tileWidth = 32;
	var tileHeight = 32;
	var gridWidth = 0;
	var gridHeight = 0;

	var pathStart = [];
	var pathEnd = [];

	var playerInArea = [];

	var viewportUnits = 'vw'; 
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();

	var pathfinder =
	{
		createGrid: function(elem)
		{
			gridWidth = $(elem).width() / tileWidth;
			gridHeight = $(elem).height() / tileHeight;

			// crear nodos vacios
			for (let x=0; x < gridWidth; x++)
			{
				grid[x] = [];

				for (let y=0; y < gridHeight; y++)
					grid[x][y] = 0;
			}

			// cargar colisiones
			$('.collision').each(function ()
			{
				let pos = enviroment.getPositions($(this));
				let nodesX = Math.ceil((pos[0][1] - pos[0][0]) / tileWidth);
				let nodesY = Math.ceil((pos[1][1] - pos[1][0]) / tileHeight);

				for (let i=0; i<nodesX && i<grid.length; i++)
				{
					let x = Math.round(pos[0][0] / tileWidth) + i;
					for (let j=0; j<nodesY && x<grid.length; j++)
					{
						let y = Math.round(pos[1][0] / tileHeight) + j;
						if (y <= grid[x].length)
							grid[x][y] = 1;
					}
				}
			});
		},
		getNode: function(x, y)
		{
			let nX = Math.floor(x / tileWidth);
			let nY = Math.floor(y / tileHeight);
			return [nX, nY];
		},
		getNodePosition: function(node)
		{
			let x = node[0] * tileWidth + (tileWidth / 2);
			let y = node[1] * tileHeight + (tileHeight / 2);
			return [x, y];
		},
		redraw: function(path)
		{
			$('.node, .start, .end, .block, .path').remove();

			var type = "node";

			/*
			for (var x=0; x < gridWidth; x++)
			{
				for (var y=0; y < gridHeight; y++)
				{
					switch(grid[x][y])
					{
						case 1:
							type = "block";
							break;
						default:
							type = "node";
							break;
					}

					// draw it
					let node = $('<div class="'+type+'"></div>');
					$(node).css({width: tileWidth, height: tileHeight, left: x*tileWidth, top: y*tileHeight});
					$(area).append(node);

				}
			}
			*/

			for (rp=0; rp<path.length; rp++)
			{
				switch(rp)
				{
				case 0:
					type = "start"; // start
					break;
				case path.length-1:
					type = "end"; // end
					break;
				default:
					type = "path"; // path node
					break;
				}

				let node = $('<div class="'+type+'"></div>');
				$(node).css({width: tileWidth, height: tileHeight, left: path[rp][0]*tileWidth, top: path[rp][1]*tileHeight});
				$(area).append(node);
			}
		},
		findPath: function(pathStart, pathEnd)
		{
			let maxWalkableTileNum = 0;

			let gridWidth = grid.length;
			let gridHeight = grid.length;
			let gridSize =	gridWidth * gridHeight;

			let distanceFunction = DiagonalDistance;
			let findNeighbours = DiagonalNeighbours;

			function DiagonalDistance(Point, Goal)
			{
				return Math.max(Math.abs(Point.x - Goal.x), Math.abs(Point.y - Goal.y));
			}

			function Neighbours(x, y)
			{
				let	N = y - 1,
				S = y + 1,
				E = x + 1,
				W = x - 1,
				myN = N > -1 && canWalkHere(x, N),
				myS = S < gridHeight && canWalkHere(x, S),
				myE = E < gridWidth && canWalkHere(E, y),
				myW = W > -1 && canWalkHere(W, y),
				result = [];
				if (myN)
					result.push({x:x, y:N});
				if (myE)
					result.push({x:E, y:y});
				if (myS)
					result.push({x:x, y:S});
				if (myW)
					result.push({x:W, y:y});
				findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
				return result;
			}

			function DiagonalNeighbours(myN, myS, myE, myW, N, S, E, W, result)
			{
				if (myN)
				{
					if (myE && canWalkHere(E, N))
						result.push({x:E, y:N});
					if (myW && canWalkHere(W, N))
						result.push({x:W, y:N});
				}
				if (myS)
				{
					if (myE && canWalkHere(E, S))
						result.push({x:E, y:S});
					if (myW && canWalkHere(W, S))
						result.push({x:W, y:S});
				}
			}

			function DiagonalNeighboursFree(myN, myS, myE, myW, N, S, E, W, result)
			{
				myN = N > -1;
				myS = S < gridHeight;
				myE = E < gridWidth;
				myW = W > -1;
				if (myE)
				{
					if(myN && canWalkHere(E, N))
					result.push({x:E, y:N});
					if(myS && canWalkHere(E, S))
					result.push({x:E, y:S});
				}
				if (myW)
				{
					if (myN && canWalkHere(W, N))
						result.push({x:W, y:N});
					if (myS && canWalkHere(W, S))
						result.push({x:W, y:S});
				}
			}

			function canWalkHere(x, y)
			{
				return ((grid[x] != null) && (grid[x][y] != null) && (grid[x][y] <= maxWalkableTileNum));
			}

			function Node(Parent, Point)
			{
				let newNode = 
				{
					Parent:Parent,
					value:Point.x + (Point.y * gridWidth),
					x:Point.x,
					y:Point.y,
					f:0,
					g:0
				};

				return newNode;
			}

			function calculatePath()
			{
				let	mypathStart = Node(null, {x:pathStart[0], y:pathStart[1]});
				let mypathEnd = Node(null, {x:pathEnd[0], y:pathEnd[1]});
				let AStar = new Array(gridSize);
				let Open = [mypathStart];
				let Closed = [];
				let result = [];
				let myNeighbours;
				let myNode;
				let myPath;
				let length, max, min, i, j;

				while (length = Open.length)
				{
					max = gridSize;
					min = -1;
					for (i = 0; i < length; i++)
					{
						if (Open[i].f < max)
						{
							max = Open[i].f;
							min = i;
						}
					}

					myNode = Open.splice(min, 1)[0];

					if (myNode.value === mypathEnd.value)
					{
						myPath = Closed[Closed.push(myNode) - 1];

						do {
							result.push([myPath.x, myPath.y]);
						}
						while (myPath = myPath.Parent);

						AStar = Closed = Open = [];
						result.reverse();
					}
					else 
					{
						myNeighbours = Neighbours(myNode.x, myNode.y);

						for (i = 0, j = myNeighbours.length; i < j; i++)
						{
							myPath = Node(myNode, myNeighbours[i]);
							if (!AStar[myPath.value])
							{
								myPath.g = myNode.g + distanceFunction(myNeighbours[i], myNode);
								myPath.f = myPath.g + distanceFunction(myNeighbours[i], mypathEnd);
								Open.push(myPath);
								AStar[myPath.value] = true;
							}
						}
						Closed.push(myNode);
					}
				}
				return result;
			}
			return calculatePath();
		}
	}

    var enviroment =
    {
		getPositions: function(elem)
		{
			let pos, left, top, width, height;
			pos = enviroment.getOffset($(elem));
			left = Math.round(pos.left);
			top = Math.round(pos.top);
			width = Math.round($(elem).innerWidth());
			height = Math.round($(elem).innerHeight());
			return [[left, left + width], [top, top + height]];
		},
		getCollisions: function()
		{
			let col = [];
			$('.collision').each(function()
			{
				if (options.debug)
					$(this).css('border', '1px solid blue');

				col.push(enviroment.getPositions($(this)));
			});
			return col;
		},
		getOffset: function(elem)
		{
			let pos = $(elem).offset();
			pos.top += parseInt($(elem).css('border-top-width'));
			pos.right += parseInt($(elem).css('border-right-width'));
			pos.bottom += parseInt($(elem).css('border-bottom-width'));
			pos.left += parseInt($(elem).css('border-left-width'));
			return pos;
		},
		getDistance: function(elem)
		{
			let bounds = enviroment.getPositions(area);
			let pos = enviroment.getPositions($(elem));
			//collisions = enviroment.getCollisions();
			let distance = [];
			
			distance["top"] = pos[1][0] - bounds[1][0];
			distance["right"] = bounds[0][1] - pos[0][1];
			distance["bottom"] = bounds[1][1] - pos[1][1];
			distance["left"] = pos[0][0] - bounds[0][0];

			for (let i=0; i<collisions.length; i++)
			{
				if (JSON.stringify(pos) === JSON.stringify(collisions[i]))
					continue;

				if (pos[1][1] > collisions[i][1][0] && pos[0][1] > collisions[i][0][0] && pos[0][0] < collisions[i][0][1])
					distance["top"] = Math.min(distance["top"], pos[1][0] - collisions[i][1][1]);
				if (collisions[i][0][1] > pos[0][0] && pos[1][1] > collisions[i][1][0] && pos[1][0] < collisions[i][1][1])
					distance["right"] = Math.min(distance["right"], collisions[i][0][0] - pos[0][1]);
				if (collisions[i][1][1] > pos[1][0] && pos[0][1] > collisions[i][0][0] && pos[0][0] < collisions[i][0][1])
					distance["bottom"] = Math.min(distance["bottom"], collisions[i][1][0] - pos[1][1]);
				if (pos[0][1] > collisions[i][0][0] && pos[1][1] > collisions[i][1][0] && pos[1][0] < collisions[i][1][1])
					distance["left"] = Math.min(distance["left"], pos[0][0] - collisions[i][0][1]);
			}
			return distance;
		},
		detectCollision: function(elem)
		{
			let distance = enviroment.getDistance($(elem));

			if (distance["top"] < 0 || distance["right"] < 0 || distance["bottom"] < 0 || distance["left"] < 0)
				return true;

			return false;
		},
		checkRange: function(elem1, elem2, range)
		{
			let pos1 = enviroment.getPositions($(elem1));
			let pos2 = enviroment.getPositions($(elem2));

			let x2 = pos2[0][0] + (pos2[0][1] - pos2[0][0] / 2);
			let x1 = pos1[0][0] + (pos1[0][1] - pos1[0][0] / 2);
			let y2 = pos2[1][0] + (pos2[1][1] - pos2[1][0] / 2);
			let y1 = pos1[1][0] + (pos1[1][1] - pos1[1][0] / 2);

			let dx = x2 - x1;
			let dy = y2 - y1;

			if (options.debug)
			{
				if ($(elem1).find('.range').length == 0)
					$(elem1).append('<div class="range"></div>');

				if ($(elem2).find('.range').length == 0)
					$(elem2).append('<div class="range"></div>');

				let scaleX = range + (pos2[0][1] - pos2[0][0]);
				let scaleY = range + (pos2[1][1] - pos2[1][0]);
				let scale = Math.min(scaleX, scaleY);
				$(elem1).find('.range').css({width: (pos1[0][1] - pos1[0][0])+'px', height: (pos1[1][1] - pos1[1][0])+'px', left: '0px', top: '0px'});
				$(elem2).find('.range').css({width: scale+'px', height: scale+'px', left: ((pos2[0][1] - pos2[0][0] - scale) / 2)+'px', top: ((pos2[1][1] - pos2[1][0] - scale) / 2)+'px'});
			}

			if (range > Math.sqrt((dx*dx) + (dy*dy)))
			    return true;

			return false;
		},
		checkArea: function(elem1, elem2)
		{
			let pos1 = enviroment.getPositions($(elem1));
			let pos2 = enviroment.getPositions($(elem2));
			let distance = [];

			if (pos1[1][1] > pos2[1][0] && pos1[0][1] > pos2[0][0] && pos1[0][0] < pos2[0][1])
				distance["top"] = pos1[1][0] - pos2[1][1];
			if (pos2[0][1] > pos1[0][0] && pos1[1][1] > pos2[1][0] && pos1[1][0] < pos2[1][1])
				distance["right"] = pos2[0][0] - pos1[0][1];
			if (pos2[1][1] > pos1[1][0] && pos1[0][1] > pos2[0][0] && pos1[0][0] < pos2[0][1])
				distance["bottom"] = pos2[1][0] - pos1[1][1];
			if (pos1[0][1] > pos2[0][0] && pos1[1][1] > pos2[1][0] && pos1[1][0] < pos2[1][1])
				distance["left"] = pos1[0][0] - pos2[0][1];

			if (options.debug)
				$(elem2).css({'border': '1px solid red', 'z-index': 99});

			if (distance["top"] < 0 || distance["right"] < 0 || distance["bottom"] < 0 || distance["left"] < 0)
				return true;

			return false;
		}
    };

	randomSpawn = function(elem)
	{
		let distance, randX, randY;
		do
		{
			randX = Math.round(Math.random() * (0, area.innerWidth() - $(elem).outerWidth()));
			randY = Math.round(Math.random() * (0, area.innerHeight() - $(elem).outerHeight()));
			$(elem).css({top: randY+"px", left: randX+"px"});
			distance = enviroment.getDistance($(elem));
		}
		while (enviroment.detectCollision(elem));

		collisions = enviroment.getCollisions();
	}

	update = function()
	{
		if ($(player).data('health') <= 0 && !$(player).hasClass('dead'))
			$(player).kill();

		$('.npc').each(function()
		{
			if ($(this).data('health') <= 0 && !$(this).hasClass('dead'))
				$(this).kill();

			let origin = $(this).data('origin');
			let node1 = JSON.stringify(pathfinder.getNode(origin[0], origin[1]));
			let node2 = JSON.stringify(pathfinder.getNode($(this).offset().left, $(this).offset().top));

			if (node1 == node2 && $(this).data('action') != 'idle' && $(this).data('action') != 'hunt')
				$(this).data('action', 'idle');
		});

		$(".projectile").each(function()
		{
			let projectile = this;

			if (enviroment.detectCollision($(this)))
			{
				$(this).remove();
				return;
			}

			$('.npc').each(function ()
			{
				if ($(this).data('health') > 0)
				{
					if (enviroment.checkRange($(projectile), $(this), 80))
					{
						$(this).attack($(player));
						$(this).data('action', 'hunt');
						damage($(this), 20);
						$(projectile).remove();
						return;
					}
				}
			});

			let x = $(this).data("x");
			let y = $(this).data("y");
			let eX = $(this).data("eX");
			let eY = $(this).data("eY");

			if ($(this).data('target'))
			{
				let target = $(this).data('target');
				eX = $(target).offset().left;
				eY = $(target).offset().top;
			}

			move($(this), x, y, eX, eY, 3, true);
		});

		playerMovement();
		options.onUpdate();
	}

	damage = function(elem, dmg)
	{
		let multiplier = dmg / 3;
		dmg = Math.floor(Math.random() * ((dmg + multiplier) - (dmg - multiplier) + 1) + (dmg - multiplier));
		let health = $(elem).data('health') - dmg;
		$(elem).data('health', health);
		$(elem).find('.health-bar').progressbar({value: health});

		let txt = dmg;

		if ($(elem)[0] == $(player)[0])
			txt = '-'+dmg;

		let div = $('<div class="damage">'+txt+'</div>');
		$(div).css('font-size', (multiplier + 12)+'px').animate({top: '-=15px', opacity: 0}, 500);
		$(elem).append(div);
		setTimeout(function() { $(div).remove(); }, 500);
	}

	$.fn.kill = function()
	{
		clearInterval(animateTimeout[$(this).attr('id')]);
		$(this).stopCast();
		$(this).data('health', 0);
		$(this).addClass('dead');
		$(this).find('.health-bar').progressbar('destroy');

		if ($(this)[0] == $(player)[0])
			options.onPlayerDie(player);
		else
			options.onNPCDie(this);
	}

	$.fn.revive = function()
	{
		$(this).data('health', 100);
		$(this).removeClass('dead lootable');
		$(this).find('.health-bar').progressbar({value: 100});

		if ($(this).data('action'))
			$(this).data('action', '');
	}

	$.fn.isAlive = function()
	{
		return $(this).data('health') && $(this).data('health') > 0;
	}

	$.fn.setHealth = function(value)
	{
		let current = $(this).data('health');
		$(this).data('health', value);
		$(this).find('.health-bar').progressbar({value: value});
	}

	playerMovement = function()
	{
		if (!$(player).isAlive() || !$(player).is(':visible'))
			return;

		$('.trigger').each(function ()
		{
			if (enviroment.checkArea($(player), $(this)))
			{
				if (!playerInArea[$(this).attr('id')])
				{
					playerInArea[$(this).attr('id')] = true;
					options.onPlayerEnterArea($(this));
				}
			}
			else
				playerInArea[$(this).attr('id')] = false;
		});

		let direction = $(player).data('direction');
		let distance = enviroment.getDistance($(player));

		if (keyMap[38] && keyMap[39] || keyMap[87] && keyMap[68])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "topright")
				$(player).data('direction', 'topright');

			if (distance["top"] > 5)
				$(player).css({top: "-="+1/1.4+"px"});
			else
				$(player).css({top: "-="+distance["top"]+"px"});

			if (distance["right"] > 5)
				$(player).css({left: "+="+1/1.4+"px"});
			else
				$(player).css({left: "+="+distance["right"]+"px"});
		}
		else if (keyMap[40] && keyMap[39] || keyMap[83] && keyMap[68])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "bottomright")
				$(player).data('direction', 'bottomright');

			if (distance["right"] > 5)
				$(player).css({left: "+="+(1/1.4)+"px"});
			else
				$(player).css({left: "+="+distance["right"]+"px"});

			if (distance["bottom"] > 5)
				$(player).css({top: "+="+(1/1.4)+"px"});
			else
				$(player).css({top: "+="+distance["bottom"]+"px"});
		}
		else if (keyMap[40] && keyMap[37] || keyMap[83] && keyMap[65])
		{
			$(player).stopCast();
			if (direction != "bottomleft")
				$(player).data('direction', 'bottomleft');

			if (distance["left"] > 5)
				$(player).css({left: "-="+(1/1.4)+"px"});
			else
				$(player).css({left: "-="+distance["left"]+"px"});

			if (distance["bottom"] > 5)
				$(player).css({top: "+="+(1/1.4)+"px"});
			else
				$(player).css({top: "+="+distance["bottom"]+"px"});
		}
		else if (keyMap[38] && keyMap[37] || keyMap[87] && keyMap[65])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "topleft")
				$(player).data('direction', 'topleft');

			if (distance["top"] > 5)
				$(player).css({top: "-="+1/1.4+"px"});
			else
				$(player).css({top: "-="+distance["top"]+"px"});

			if (distance["left"] > 5)
				$(player).css({left: "-="+(1/1.4)+"px"});
			else
				$(player).css({left: "-="+distance["left"]+"px"});
		}
		else if (keyMap[38] || keyMap[87])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "top")
				$(player).data('direction', 'top');

			if (distance["top"] > 5)
				$(player).css({top: "-=1px"});
			else
				$(player).css({top: "-="+distance["top"]+"px"});
		}
		else if (keyMap[39] || keyMap[68])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "right")
				$(player).data('direction', 'right');

			if (distance["right"] > 5)
				$(player).css({left: "+=1px"});
			else
				$(player).css({left: "+="+distance["right"]+"px"});
		}
		else if (keyMap[40] || keyMap[83])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "bottom")
				$(player).data('direction', 'bottom');

			if (distance["bottom"] > 5)
				$(player).css({top: "+=1px"});
			else
				$(player).css({top: "+="+distance["bottom"]+"px"});
		}
		else if (keyMap[37] || keyMap[65])
		{
			$(player).stopCast();
			$(player).data('action', 'walk');

			if (direction != "left")
				$(player).data('direction', 'left');

			if (distance["left"] > 5)
				$(player).css({left: "-=1px"});
			else
				$(player).css({left: "-="+distance["left"]+"px"});
		}
		else if ($(player).data('action') != 'cast')
			$(player).data('action', 'idle');

		options.onPlayerMove($(player).data('direction'));

		if (keyMap[32])
		{
			$(player).cast();
		}
	}

	$(player).append('<div class="health-bar"></div>');
	$(player).data('health', 100);
	$(player).find('.health-bar').progressbar({value: 100});

	$.fn.cast = function(coordX, coordY)
	{
		if ($(this).data('action') != 'cast')
		{
			$(this).data('action', 'cast');
			let bar = $('<div class="cast-bar"><div class="progress"></div></div>');
			$(bar).find('.progress').animate({width: '100%'}, 1500);
			$(this).append(bar);
			let elem = this;
			castTimeout[$(this).attr('id')] = setTimeout(function() { $(elem).shoot(coordX, coordY); }, 1500);

			if ($(this)[0] == $(player)[0])
				options.onPlayerCast(coordX, coordY);
			else
				options.onNPCCast($(this), coordX, coordY);
		}
	}

	$.fn.stopCast = function()
	{
		if ($(this).data('action') == 'cast')
		{
			clearTimeout(castTimeout[$(this).attr('id')]);
			$(this).find('.cast-bar').remove();
			$(this).data('action', "");
			options.onPlayerStopCast();
		}
	}

	$.fn.shoot = function(coordX, coordY)
	{
		$(this).stopCast();

		if (readyToShoot)
		{
			let direction = $(this).data('direction');
			let target = null;

			if ($('.target').length != 0 && !$('.target').parent().hasClass('dead'))
			{
				target = $('.target').parent();
				coordX = $(target).position().left;
				coordY = $(target).position().top;
			}

			if (coordX === undefined || coordY === undefined)
			{
				switch (direction)
				{
					case 'topright':
						coordX = $(this).position().left + 100;
						coordY = $(this).position().top - 100;
						break;
					case 'topleft':
						coordX = $(this).position().left - 100;
						coordY = $(this).position().top - 100;
						break;
					case 'bottomright':
						coordX = $(this).position().left + 100;
						coordY = $(this).position().top + 100;
						break;
					case 'bottomleft':
						coordX = $(this).position().left - 100;
						coordY = $(this).position().top + 100;
						break;
					case 'top':
						coordX = $(this).position().left + 20;
						coordY = $(this).position().top - 100;
						break;
					case 'bottom':
						coordX = $(this).position().left + 20;
						coordY = $(this).position().top + 100;
						break;
					case 'right':
						coordX = $(this).position().left + 100;
						coordY = $(this).position().top + 20;
						break;
					case 'left':
						coordX = $(this).position().left - 100;
						coordY = $(this).position().top + 20;
						break;
				}
			}

			let projectile = $("<div>").addClass("projectile "+options.projectileClass);
			let offsetX = $(this).position().left + 20;
			let offsetY = $(this).position().top + 20;

			let b = offsetX - coordX;
			let c = offsetY - coordY;
			let angle = Math.atan2(offsetX - coordX, offsetY - coordY) * (180 / Math.PI);

			$(projectile).css({top: offsetY, left: offsetX});
			$(projectile).data({"x": offsetX, "y": offsetY, "eX": coordX, "eY": coordY, "target": target});
			$(area).append($(projectile));

			if ($(this)[0] == $(player)[0])
				options.onPlayerShoot($(projectile));
			else
				options.onNPCShoot($(this), $(projectile));
		}
	}

	$.fn.attack = function(target)
	{
		let x = $(this).offset().left + $(this).width() / 2;
		let y = $(this).offset().top + $(this).height() / 2;

		let eX = $(player).offset().left;
		let eY = $(player).offset().top;

		let currentNode = pathfinder.getNode(x, y);
		let targetNode = pathfinder.getNode(eX, eY);

		if (JSON.stringify(currentNode) != JSON.stringify(targetNode) && $(this).data('action') == 'attack')
			$(this).data('action', '');

		let npc = this;
		$(this).walkTo(eX, eY, 0.7, function()
		{
			if ($(npc).data('action') != 'attack')
				$(npc).data({animating: '', action: 'attack'});
		});
	}

	$.fn.inRangeOf = function(target, range)
	{
		return enviroment.checkRange($(this), $(target), range);
	}

	$.fn.walkTo = function(eX, eY, speed, complete)
	{
		let x = $(this).offset().left + $(this).width() / 2;
		let y = $(this).offset().top + $(this).height() / 2;

		let currentNode = pathfinder.getNode(x, y);
		let targetNode = pathfinder.getNode(eX, eY);

		if (JSON.stringify(currentNode) == JSON.stringify(targetNode) && complete)
		{
			complete();
			return false;
		}

		let path = null;

		if ($(this).data('path'))
			path = JSON.parse($(this).data('path'));

		if (path == null || JSON.stringify(targetNode) != JSON.stringify(path[path.length-1]))
		{
			path = pathfinder.findPath(currentNode, targetNode);
			$(this).data({'path': JSON.stringify(path), 'nextNode': 0});
		}

		if (options.debug)
			pathfinder.redraw(path);

		if ($(this).data('nextNode') < path.length)
		{
			let nextNode = path[$(this).data('nextNode')];
			let node = pathfinder.getNodePosition(nextNode);

			if (JSON.stringify(currentNode) == JSON.stringify(nextNode))
			{
				let i = $(this).data('nextNode');
				$(this).data('nextNode', i+1);
			}

			eX = node[0];
			eY = node[1];
		}

		move($(this), x, y, eX, eY, speed);

		return false;
	}

	move = function(elem, x, y, eX, eY, speed, rotate)
	{
		let dx = (eX - x);
		let dy = (eY - y);
		let mag = Math.sqrt(dx * dx + dy * dy);
		let vx = (dx / mag) * speed;
		let vy = (dy / mag) * speed;
		let ang = 180 - (Math.atan2(dx, dy) * 180 / Math.PI);

		let direction = "";

		if (ang > 337.5 || ang <= 22.5)
			direction = "top";
		else if (ang > 22.5 && ang <=  67.5)
			direction = "topright";
		else if (ang > 67.5 && ang <= 112.5)
			direction = "right";
		else if (ang > 112.5 && ang <= 157.5)
			direction = "bottomright";
		else if (ang > 157.5 && ang <= 202.5)
			direction = "bottom";
		else if (ang > 202.5 && ang <= 247.5)
			direction = "bottomleft";
		else if (ang > 247.5 && ang <= 292.5)
			direction = "left";
		else if (ang > 292.5 && ang <= 337.5)
			direction = "topleft";

		$(elem).data('direction', direction);
		$(elem).css({left: "+="+vx+"px", top: "+="+vy+"px"});

		if (rotate)
			$(elem).css('transform', 'rotate('+ang+'deg)');
	}

	collisions = enviroment.getCollisions();

	$(document).keydown(function(e) {
		if (e.keyCode in keyMap)
			keyMap[e.keyCode] = true;
	});

	$(document).keyup(function(e) {
		if (e.keyCode in keyMap) 
			keyMap[e.keyCode] = false;
	});

	if (options.fullscreen)
	{
		$(document).ready(function(e) { resize(e); });
		$(window).resize(function(e) { resize(e); });
	}

	function setViewportPosition(elem)
	{
		let params = $(elem).data('params');

		if (!params.spawnVw && !params.spawnVh)
		{
			params.spawnVw = {left: pxToVw($(elem).css('left')), top: pxToVw($(elem).css('top'))};
			params.spawnVh = {left: pxToVh($(elem).css('left')), top: pxToVh($(elem).css('top'))};
			$(elem).data('params', params);
			params = $(elem).data('params');
		}

		if (viewportUnits == 'vw')
		{
			$(elem).data('origin', [vwToPx(params.spawnVw.left), vwToPx(params.spawnVw.top)]);
			$(elem).css({left: parseFloat(params.spawnVw.left)+'vw', top: parseFloat(params.spawnVw.top)+'vw', right: parseFloat(params.spawnVw.right)+'vw', bottom: parseFloat(params.spawnVw.bottom)+'vw'});
		}
		else
		{
			$(elem).data('origin', [vhToPx(params.spawnVh.left), vhToPx(params.spawnVh.top)]);
			$(elem).css({left: parseFloat(params.spawnVh.left)+'vh', top: parseFloat(params.spawnVh.top)+'vh', right: parseFloat(params.spawnVh.right)+'vh', bottom: parseFloat(params.spawnVh.bottom)+'vh'});
		}

		if (params.destVw && params.destVh)
		{
			if (viewportUnits == 'vw')
				$(elem).data('dest', [vwToPx(params.destVw.x), vwToPx(params.destVw.y)]);
			else
				$(elem).data('dest', [vhToPx(params.destVh.x), vhToPx(params.destVh.y)]);
		}

		if (params.sizeVw && params.sizeVw)
		{
			if (viewportUnits == 'vw')
				$(elem).css({width: parseFloat(params.sizeVw.width)+'vw', height: parseFloat(params.sizeVw.height)+'vw'});
			else
				$(elem).css({width: parseFloat(params.sizeVh.width)+'vh', height: parseFloat(params.sizeVh.height)+'vh'});
		}
	}

	function resize(e)
	{
		let x = $(window).width();
		let y = $(window).height();
		let hw = Math.atan2(y, x);

		x = $('#bg3').width();
		y = $('#bg3').height();
		let hi = Math.atan2(y, x);

		viewportUnits = 'vw';

		if (hw > hi)
			viewportUnits = 'vh';

		$('.collision, .trigger').each(function ()
		{
			setViewportPosition($(this));
		});

		$('.npc').each(function ()
		{
			setViewportPosition($(this));
			$(this).removeData('path');
		});

		collisions = enviroment.getCollisions();
		pathfinder.createGrid($(area));
	}

	function pxToVw(val) {
		return Math.round(parseFloat(val) * 100 / windowWidth);
	}

	function pxToVh(val) {
		return Math.round(parseFloat(val) * 100 / windowHeight);
	}

	function vwToPx(val) {
		return Math.round(parseFloat(val) * windowWidth / 100);
	}

	function vhToPx(val) {
		return Math.round(parseFloat(val) * windowHeight / 100);
	}

    var arrowEngine =
    {
        onKeyPress: function(key, keydown, keyup)
        {
        	keyMap[key] = false;

            movement = (function()
            {
            	var old = movement;
            	return function()
            	{
            		if (keyMap[key])
            		{
            			if (keydown !== undefined)
            				keydown();
            		}
            		else
            		{
            			if (keyup !== undefined)
            				keyup();
            		}

            		return old.apply(this, arguments);
            	};
            })();
        },
        addCollision: function(options)
        {
        	let id = 'col'+($('.collision').length + 1);
        	let col = $('<div id="'+id+'" class="collision '+options.customClass+'"></div>');
        	$(area).append($(col));
        	$(col).data('params', options);
        	setViewportPosition($(col));
        	collisions = enviroment.getCollisions();
        	pathfinder.createGrid($(area));
        },
        setPlayer: function(player, options)
        {
        	player = $(player);
        	$(player).data('params', options);
        	setViewportPosition($(player));
        },
        addNPC: function(options)
        {
        	let id = 'npc'+($('.npc').length + 1);
        	let npc = $('<div id="'+id+'" class="npc '+options.customClass+'"></div>');

        	if (options == undefined)
        		options = [];

        	$(area).append(npc);

        	$(npc).append('<div class="health-bar"></div>');
        	$(npc).find('.health-bar').progressbar({value: options.health, max: options.health });
			$(npc).data(
			{
				health: options.health,
				origin: [$(npc).offset().left, $(npc).offset().top],
				ready: 1,
				params: options
			});

        	setViewportPosition($(npc));

			$(npc).click(function (e) {
				e.stopPropagation();
				$('.target').remove();
				$(npc).append('<div class="target"></div>');
			});
        },
        addTrigger: function(options)
        {
        	let trigger = $('<div id="'+options.name+'" class="trigger"></div>');
        	$(trigger).css('position', 'absolute');
        	$(area).append($(trigger));
        	$(trigger).data('params', options);
        	setViewportPosition($(trigger));
        }
    };

    return arrowEngine;
};