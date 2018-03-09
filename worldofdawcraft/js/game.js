var player = $('#player');
var score = 0;
var deaths = 0;
var deathLimit = 4;
var currentLevel = 1;
var timeLimit = 120;
var timer = timeLimit + 1;
var timeInterval  = null;
var msgTimeout = null;
var animateTimeout = [];

updateTimer();
$('#score span').text(score);
$('#deaths span').text(deaths);
$('#btnStart').click(start);
$(player).hide();

var game = $("#area").arrowEngine($('#player'),
{
	enableShooting: true,
	playerClass: 'player',
	projectileClass: 'spell',
	debug: false,

	onUpdate: function()
	{
		$('.npc').each(function()
		{
			let npc = this;

			if (!$(this).isAlive())
				return;

			let animY = 0;
			let speed = 12;

			let size = 50;
			if ($(this).is('.orc') || $(this).is('.grunt') || $(this).is('.deathknight'))
				size = 60;

			if ($(player).isAlive() && ($(player).inRangeOf($(this), 300) || $(this).data('action') == 'hunt'))
			{
				$(this).attack($(player));
			}
			else
			{
				if ($(this).data('health') < 100)
					$(this).setHealth(100);

				let origin = $(this).data('origin');
				let dest = $(this).data('dest');

				$(this).data('action', '');

				if (dest)
				{
					let moveSpeed = 0.5;
					if ($(this).is('.deathknight'))
						moveSpeed = 0.7;

					$(this).walkTo(dest[0], dest[1], moveSpeed, function() {
						$(npc).data({'dest': origin, 'origin': dest});
					});
					speed = 5;
				}
				else
				{
					$(this).walkTo(origin[0], origin[1], 1, function() {
						clearTimeout(animateTimeout[$(npc).attr('id')]);
						$(npc).data('action', 'idle');
					});
				}
			}

			if ($(this).data('action') == 'attack')
			{
				if ($(this).data('ready') == 1)
				{
					damage($(player), 5);
					$(this).data('ready', 0);
					let elem = this;
					setTimeout(function () { $(elem).data('ready', 1); }, 2000);
				}

				animY = -5*size;
				speed = 5;
			}
			else if ($(this).data('action') == 'idle' && $(this).data('animating') != 'idle')
			{
				let steps = 5;
				if (currentLevel == 2 && $(this).is('.orc'))
					steps = 3;

				$(this).css({'background-position': '-'+(steps*size)+'px 0px'});
				$(this).data('animation', 'idle');
			}

			if ($(this).is('.deathknight'))
				speed = 7;

			switch ($(this).data('direction'))
			{
				case 'bottom':
					if ($(this).data('animating') != 'bottom')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -4*size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'bottom');
					}
					break;
				case 'bottomleft':
					if ($(this).data('animating') != 'bottomleft')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -7*size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'bottomleft');
					}
					break;
				case 'bottomright':
					if ($(this).data('animating') != 'bottomright')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -3*size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'bottomright');
					}
					break;
				case 'top':
					if ($(this).data('animating') != 'top')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px', 'transform': 'none'});
						animateSprite(this, -2, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'top');
					}
					break;
				case 'left':
					if ($(this).data('animating') != 'left')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -6*size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'left');
					}
					break;
				case 'right':
					if ($(this).data('animating') != 'right')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -2*size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'right');
					}
					break;
				case 'topright':
					if ($(this).data('animating') != 'topright')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'topright');
					}
					break;
				case 'topleft':
					if ($(this).data('animating') != 'topleft')
					{
						clearTimeout(animateTimeout[$(this).attr('id')]);
						$(this).css({'background-position-y': '0px'});
						animateSprite(this, -5*size, 0+animY, size, 5, speed, true);
						$(this).data('animating', 'topleft');
					}
					break;
			}
		});
	},
	onPlayerMove: function(direction)
	{
		let animation = $(player).data('animation');
		let action = $(player).data('action');

		if (action == 'walk')
		{
			if (direction == 'topright' && animation != "topright")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'topright');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -68, 0, 60, 5, 10, true);
			}
			else if (direction == 'bottomright' && animation != "bottomright")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'bottomright');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -182, 0, 60, 5, 10, true);
			}
			else if (direction == "bottomleft" && animation != "bottomleft")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'bottomleft');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -437, 0, 60, 5, 10, true);
			}
			else if (direction == "topleft" && animation != "topleft")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'topleft');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -311, 0, 60, 5, 10, true);
			}
			else if (direction == "top" && animation != "top")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'top');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -9, 0, 60, 5, 10, true);
			}
			else if (direction == "right" && animation != "right")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'right');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -129, 0, 60, 5, 10, true);
			}
			else if (direction == "bottom" && animation != "bottom")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'bottom');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -248, 0, 60, 5, 10, true);
			}
			else if (direction == "left" && animation != "left")
			{
				clearTimeout(animateTimeout[$(player).attr('id')]);
				$(player).data('animation', 'left');
				$(player).css({'background-position-y': '0px'});
				animateSprite(player, -372, 0, 60, 5, 10, true);
			}
		}
		else if (action == 'idle')
			$(player).data('animation', '');

	},
	onPlayerDie: function(player)
	{
		clearInterval(timeInterval);
		clearTimeout(animateTimeout[$(player).attr('id')]);
		$(player).data('animation', 'die');
		animateSprite($(player), -492, 0, 60, 5, 12, false);
		deaths++;
		$('#deaths span').text(deaths);

		if (deaths < deathLimit)
		{
			alertBox("Has muerto", 'Resucitar', function()
			{
				$(player).revive();
				$(player).css({'background-position': '-9px 0px', opacity: 0});
				$(player).animate({opacity: 1}, 1000);

				if (timer <= 0)
					restartLevel();

				timeInterval = setInterval(updateTimer, 1000);
			});
		}
		else
		{
			alertBox("Lo siento, ¡has muerto demasiadas veces!", 'Jugar de nuevo', function()
			{
				location.reload();
			});
		}
	},
	onNPCDie: function(npc)
	{
		$(npc).data('animation', 'die');
		let x = $(npc).css('background-position-x');
		clearTimeout(animateTimeout[$(npc).attr('id')]);

		let steps = 10;
		let size = 50;
		if ($(npc).is('.orc') || $(npc).is('.grunt') || $(npc).is('.deathknight'))
		{
			steps = 9;
			size = 60;
		}
		animateSprite($(npc), x, -steps*size, size, 2, 10, false);

		if (!$(npc).hasClass('lootable') && $(npc).data('params').items.length > 0)
			$(npc).addClass("lootable");
	},
	onPlayerShoot: function(projectile)
	{
		animateSprite(projectile, 0, 0, 65, 8, 12, true);
	},
	onPlayerCast: function(coordX, coordY)
	{
		let x = parseInt($(player).css('background-position-x'));
		clearTimeout(animateTimeout[$(player).attr('id')]);
		$(player).data('animation', 'casting');
		animateSprite($(player), x, 300, 60, 4, 6, true);
	},
	onPlayerStopCast: function()
	{
		clearTimeout(animateTimeout[$(player).attr('id')]);
		$(player).css({'background-position-y': '0px'});
	},
	onPlayerEnterArea: function(area)
	{
		if ($(area).attr('id') == 'phaseTrigger')
		{
			let hasKey = false;

			if ($(player).data('items'))
			{
				let items = $(player).data('items');

				for (let i=0; i<items.length; i++)
					if (items[i].item == 'key'+currentLevel)
						hasKey = true;
			}

			if (hasKey)
			{
				if (currentLevel == 1)
					level2();
				else if (currentLevel == 2)
					level3();
				else if (currentLevel == 3)
					level4();
				else if (currentLevel == 4)
					complete();

				timer = timeLimit + 1;
				updateTimer();

				$(player).setHealth(100);

				score += 150;
				$('#score span').text(score);

				currentLevel++;
			}
			else
				floatingMessage('Necesitas Llave de acceso');
		}
	}
});

level1();

function level1()
{
	$('#area').addClass('level1');
	$('#level').text('Nivel 1');

	$('.npc').each(function () {
		clearTimeout(animateTimeout[$(this).attr('id')]);
		$(this).remove();
	});

	$(player).data('items', '');

	$('.collision, .trigger').remove();

	game.setPlayer($('#player'), { spawnVw: {left: '14vw', top: '37vw'}, spawnVh: {left: '72vh', top: '30vh'} });

	game.addNPC({ spawnVw: {left: '49vw', top: '35vw'}, spawnVh: {left: '72vh', top: '30vh'}, destVw: {x: '40vw', y: '22vw'}, destVh: {x: '75vh', y: '47vh'}, customClass: 'peon', health: 100, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });
	game.addNPC({ spawnVw: {left: '75vw', top: '36vw'}, spawnVh: {left: '72vh', top: '30vh'}, destVw: {x: '50vw', y: '43vw'}, destVh: {x: '75vh', y: '47vh'}, customClass: 'peon', health: 100, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}, {item: 'key1', units: 1, text: 'Llave de acceso'}] });

	game.addCollision({ spawnVw: {left: '34vw', top: '15vw'}, spawnVh: {left: '56vh', top: '24.5vh'}, sizeVw: {width: '6vw', height: '1vw'}, sizeVh: {width: '9vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '21vw', top: '22vw'}, spawnVh: {left: '34vh', top: '37.8vh'}, sizeVw: {width: '3vw', height: '2vw'}, sizeVh: {width: '5vh', height: '1.6vh'} });
	game.addCollision({ spawnVw: {left: '61vw', top: '25vw'}, spawnVh: {left: '100vh', top: '39.5vh'}, sizeVw: {width: '2vw', height: '6vw'}, sizeVh: {width: '3.5vh', height: '11.5vh'} });
	game.addCollision({ spawnVw: {left: '60vw', top: '31vw'}, spawnVh: {left: '98.5vh', top: '51vh'}, sizeVw: {width: '1vw', height: '5vw'}, sizeVh: {width: '1.7vh', height: '8vh'} });
	game.addCollision({ spawnVw: {left: '42vw', top: '34vw'}, spawnVh: {left: '68.5vh', top: '56vh'}, sizeVw: {width: '2vw', height: '10vw'}, sizeVh: {width: '3.5vh', height: '16vh'} });
	game.addCollision({ spawnVw: {left: '61vw', top: '24vw'}, spawnVh: {left: '100vh', top: '39vh'}, sizeVw: {width: '4vw', height: '3vw'}, sizeVh: {width: '8vh', height: '5vh'} });
	game.addCollision({ spawnVw: {left: '62.5vw', top: '22.5vw'}, spawnVh: {left: '102.5vh', top: '37vh'}, sizeVw: {width: '4.5vw', height: '3vw'}, sizeVh: {width: '7vh', height: '5vh'} });
	game.addCollision({ spawnVw: {left: '26vw', top: '19vw'}, spawnVh: {left: '42.5vh', top: '31vh'}, sizeVw: {width: '3vw', height: '2vw'}, sizeVh: {width: '5vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '19vw', top: '15vw'}, spawnVh: {left: '31vh', top: '24.5vh'}, sizeVw: {width: '3vw', height: '1vw'}, sizeVh: {width: '5vh', height: '1.7vh'} });
	game.addCollision({ spawnVw: {left: '23vw', top: '9vw'}, spawnVh: {left: '38vh', top: '14.8vh'}, sizeVw: {width: '3vw', height: '1vw'}, sizeVh: {width: '4.6vh', height: '1.7vh'} });
	game.addCollision({ spawnVw: {left: '34vw', top: '9vw'}, spawnVh: {left: '56vh', top: '14.8vh'}, sizeVw: {width: '2vw', height: '0.5vw'}, sizeVh: {width: '3.1vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '39vw', top: '6.8vw'}, spawnVh: {left: '64vh', top: '11vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.8vh'} });
	game.addCollision({ spawnVw: {left: '44.5vw', top: '8.5vw'}, spawnVh: {left: '73vh', top: '14vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '48.7vw', top: '7.4vw'}, spawnVh: {left: '80vh', top: '12vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '53vw', top: '7vw'}, spawnVh: {left: '87vh', top: '11vh'}, sizeVw: {width: '3vw', height: '3vw'}, sizeVh: {width: '5vh', height: '5vh'} });
	game.addCollision({ spawnVw: {left: '56vw', top: '13.5vw'}, spawnVh: {left: '92vh', top: '22.5vh'}, sizeVw: {width: '3vw', height: '1vw'}, sizeVh: {width: '5vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '75.5vw', top: '17.5vw'}, spawnVh: {left: '123.5vh', top: '28.5vh'}, sizeVw: {width: '3vw', height: '2vw'}, sizeVh: {width: '5vh', height: '3vh'} });
	game.addCollision({ spawnVw: {left: '66vw', top: '9vw'}, spawnVh: {left: '108vh', top: '15vh'}, sizeVw: {width: '2.5vw', height: '1.5vw'}, sizeVh: {width: '4vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '18vw', top: '31vw'}, spawnVh: {left: '29vh', top: '51vh'}, sizeVw: {width: '6.5vw', height: '3.5vw'}, sizeVh: {width: '10.5vh', height: '5.5vh'} });
	game.addCollision({ spawnVw: {left: '74.5vw', top: '41.5vw'}, spawnVh: {left: '122vh', top: '68vh'}, sizeVw: {width: '4vw', height: '2vw'}, sizeVh: {width: '7vh', height: '3.5vh'} });

	game.addTrigger({ name: 'phaseTrigger', spawnVw: {right: '0', top: '32vw'}, spawnVh: {right: '0', top: '52vh'}, sizeVw: {width: '5vw', height: '14vw'}, sizeVh: {width: '8vh', height: '24vh'} });
}

function level2()
{
	$('#area').addClass('level2');
	$('#level').text('Nivel 2');

	$('.npc').each(function () {
		clearTimeout(animateTimeout[$(this).attr('id')]);
		$(this).remove();
	});

	$(player).data('items', '');

	$('.collision, .trigger').remove();

	game.setPlayer($('#player'), { spawnVw: {left: '14vw', top: '28vw'}, spawnVh: {left: '72vh', top: '21vh'} });

	game.addNPC({ spawnVw: {left: '44vw', top: '22vw'}, spawnVh: {left: '69.5vh', top: '34vh'}, customClass: 'orc', health: 200, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}, {item: 'key2', units: 1, text: 'Llave de acceso'}] });
	game.addNPC({ spawnVw: {left: '75vw', top: '31vw'}, spawnVh: {left: '72vh', top: '25vh'}, destVw: {x: '50vw', y: '32vw'}, destVh: {x: '75vh', y: '26vh'}, customClass: 'peon', health: 100, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });

	game.addCollision({ spawnVw: {left: '33.2vw', top: '15.5vw'}, spawnVh: {left: '54vh', top: '24.8vh'}, sizeVw: {width: '1.5vw', height: '0.5vw'}, sizeVh: {width: '2.8vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '48.5vw', top: '20.5vw'}, spawnVh: {left: '79vh', top: '34vh'}, sizeVw: {width: '2vw', height: '2vw'}, sizeVh: {width: '3vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '35.5vw', top: '19vw'}, spawnVh: {left: '58vh', top: '31.5vh'}, sizeVw: {width: '11vw', height: '1vw'}, sizeVh: {width: '18.5vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '37vw', top: '24vw'}, spawnVh: {left: '61.5vh', top: '39vh'}, sizeVw: {width: '5.5vw', height: '1vw'}, sizeVh: {width: '8vh', height: '1.7vh'} });
	game.addCollision({ spawnVw: {left: '36vw', top: '21vw'}, spawnVh: {left: '59.5vh', top: '33vh'}, sizeVw: {width: '1vw', height: '4vw'}, sizeVh: {width: '2vh', height: '8vh'} });
	game.addCollision({ spawnVw: {left: '59vw', top: '25vw'}, spawnVh: {left: '96vh', top: '41vh'}, sizeVw: {width: '10.5vw', height: '2.5vw'}, sizeVh: {width: '18vh', height: '4vh'} });
	game.addCollision({ spawnVw: {left: '59.5vw', top: '22vw'}, spawnVh: {left: '97.5vh', top: '36vh'}, sizeVw: {width: '6.5vw', height: '3vw'}, sizeVh: {width: '11vh', height: '5vh'} });
	game.addCollision({ spawnVw: {left: '24vw', top: '19vw'}, spawnVh: {left: '39.5vh', top: '31vh'}, sizeVw: {width: '3vw', height: '1.5vw'}, sizeVh: {width: '5vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '17vw', top: '19.5vw'}, spawnVh: {left: '28vh', top: '31vh'}, sizeVw: {width: '2vw', height: '0.5vw'}, sizeVh: {width: '3vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '22.5vw', top: '14vw'}, spawnVh: {left: '37vh', top: '22.8vh'}, sizeVw: {width: '2vw', height: '0.5vw'}, sizeVh: {width: '3vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '28.5vw', top: '15.5vw'}, spawnVh: {left: '46.5vh', top: '24.8vh'}, sizeVw: {width: '1.5vw', height: '0.5vw'}, sizeVh: {width: '2.1vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '38.5vw', top: '14vw'}, spawnVh: {left: '63vh', top: '23vh'}, sizeVw: {width: '1.5vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.2vh'} });
	game.addCollision({ spawnVw: {left: '44.5vw', top: '8.5vw'}, spawnVh: {left: '73vh', top: '14vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '48.7vw', top: '7.4vw'}, spawnVh: {left: '80vh', top: '12vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '48vw', top: '14.5vw'}, spawnVh: {left: '78.5vh', top: '22.5vh'}, sizeVw: {width: '2.5vw', height: '0.8vw'}, sizeVh: {width: '4vh', height: '2vh'} });
	game.addCollision({ spawnVw: {left: '51vw', top: '18.5vw'}, spawnVh: {left: '83vh', top: '30vh'}, sizeVw: {width: '3vw', height: '1vw'}, sizeVh: {width: '5vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '65vw', top: '17vw'}, spawnVh: {left: '106.5vh', top: '27.5vh'}, sizeVw: {width: '3vw', height: '0.5vw'}, sizeVh: {width: '5vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '71vw', top: '15vw'}, spawnVh: {left: '116.5vh', top: '24vh'}, sizeVw: {width: '2vw', height: '0.5vw'}, sizeVh: {width: '3vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '30vw', top: '24.5vw'}, spawnVh: {left: '49.5vh', top: '40vh'}, sizeVw: {width: '7.5vw', height: '2.5vw'}, sizeVh: {width: '12vh', height: '5.5vh'} });
	game.addCollision({ spawnVw: {left: '76.8vw', top: '13vw'}, spawnVh: {left: '126vh', top: '20.8vh'}, sizeVw: {width: '1.5vw', height: '0.5vw'}, sizeVh: {width: '2vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '80vw', top: '14.5vw'}, spawnVh: {left: '131.5vh', top: '23.8vh'}, sizeVw: {width: '1.5vw', height: '0.5vw'}, sizeVh: {width: '2vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '83.8vw', top: '18.5vw'}, spawnVh: {left: '137.5vh', top: '29.8vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '3vh', height: '1.5vh'} });

	game.addTrigger({ name: 'phaseTrigger', spawnVw: {right: '0', top: '21vw'}, spawnVh: {right: '0', top: '45vh'}, sizeVw: {width: '5.5vw', height: '12vw'}, sizeVh: {width: '8vh', height: '20vh'} });
}

function level3()
{
	$('#area').addClass('level3');
	$('#level').text('Nivel 3');

	$('.npc').each(function () {
		clearTimeout(animateTimeout[$(this).attr('id')]);
		$(this).remove();
	});

	$(player).data('items', '');

	$('.collision, .trigger').remove();

	game.setPlayer($('#player'), { spawnVw: {top: '3vw', left: '12vw'}, spawnVh: {top: '3vh', left: '14vh'} });

	game.addNPC({ spawnVw: {left: '65vw', top: '20vw'}, spawnVh: {left: '90.5vh', top: '24vh'}, destVw: {x: '33vw', y: '19vw'}, destVh: {x: '47.5vh', y: '24vh'}, customClass: 'grunt', health: 250, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });
	game.addNPC({ spawnVw: {left: '67vw', top: '15vw'}, spawnVh: {left: '103.5vh', top: '21vh'}, customClass: 'grunt', health: 250, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });
	game.addNPC({ spawnVw: {left: '61vw', top: '30vw'}, spawnVh: {left: '92vh', top: '46vh'}, customClass: 'grunt', health: 250, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}, {item: 'key3', units: 1, text: 'Llave de acceso'}] });

	game.addCollision({ spawnVw: {left: '67vw', top: '7vw'}, spawnVh: {left: '107vh', top: '10.8vh'}, sizeVw: {width: '0.5vw', height: '0.5vw'}, sizeVh: {width: '1vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '49.5vw', top: '37.5vw'}, spawnVh: {left: '78vh', top: '59vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '4vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '70vw', top: '9vw'}, spawnVh: {left: '112vh', top: '15.5vh'}, sizeVw: {width: '10vw', height: '3.5vw'}, sizeVh: {width: '14.5vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '58vw', top: '23vw'}, spawnVh: {left: '94vh', top: '37vh'}, sizeVw: {width: '5.5vw', height: '2vw'}, sizeVh: {width: '8vh', height: '2.7vh'} });
	game.addCollision({ spawnVw: {left: '59vw', top: '41vw'}, spawnVh: {left: '94.5vh', top: '64.5vh'}, sizeVw: {width: '8vw', height: '2vw'}, sizeVh: {width: '13vh', height: '4vh'} });
	game.addCollision({ spawnVw: {left: '27vw', top: '24.5vw'}, spawnVh: {left: '43.5vh', top: '39vh'}, sizeVw: {width: '7.5vw', height: '2.5vw'}, sizeVh: {width: '11vh', height: '4vh'} });
	game.addCollision({ spawnVw: {left: '32.5vw', top: '9.5vw'}, spawnVh: {left: '52vh', top: '15vh'}, sizeVw: {width: '6vw', height: '1.5vw'}, sizeVh: {width: '8.5vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '87vw', top: '24vw'}, spawnVh: {left: '138vh', top: '38vh'}, sizeVw: {width: '9vw', height: '3.5vw'}, sizeVh: {width: '16vh', height: '5.5vh'} });
	game.addCollision({ spawnVw: {left: '86vw', top: '19.5vw'}, spawnVh: {left: '137vh', top: '31vh'}, sizeVw: {width: '2vw', height: '0.5vw'}, sizeVh: {width: '3.5vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '94.5vw', top: '13vw'}, spawnVh: {left: '150vh', top: '21vh'}, sizeVw: {width: '2vw', height: '0.5vw'}, sizeVh: {width: '4vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '87.5vw', top: '9vw'}, spawnVh: {left: '138.5vh', top: '14.8vh'}, sizeVw: {width: '2.5vw', height: '0.5vw'}, sizeVh: {width: '4vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '63.5vw', top: '10vw'}, spawnVh: {left: '101.5vh', top: '16vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '42.6vw', top: '13.7vw'}, spawnVh: {left: '67.7vh', top: '22vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '49vw', top: '7.5vw'}, spawnVh: {left: '78vh', top: '12.5vh'}, sizeVw: {width: '2.5vw', height: '0.8vw'}, sizeVh: {width: '4vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '42.5vw', top: '41.5vw'}, spawnVh: {left: '68vh', top: '66vh'}, sizeVw: {width: '2.5vw', height: '1vw'}, sizeVh: {width: '4vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '39vw', top: '5vw'}, spawnVh: {left: '61vh', top: '7.5vh'}, sizeVw: {width: '3vw', height: '0.5vw'}, sizeVh: {width: '5vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '7vw', top: '29vw'}, spawnVh: {left: '11vh', top: '46.5vh'}, sizeVw: {width: '2.5vw', height: '0.5vw'}, sizeVh: {width: '4.5vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '81vw', top: '31.5vw'}, spawnVh: {left: '129vh', top: '51vh'}, sizeVw: {width: '6vw', height: '2vw'}, sizeVh: {width: '10vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '19vw', top: '20vw'}, spawnVh: {left: '30.5vh', top: '32.5vh'}, sizeVw: {width: '5.5vw', height: '1.5vw'}, sizeVh: {width: '9vh', height: '1.8vh'} });
	game.addCollision({ spawnVw: {left: '2.5vw', top: '36.5vw'}, spawnVh: {left: '3.5vh', top: '58.8vh'}, sizeVw: {width: '2vw', height: '1vw'}, sizeVh: {width: '4vh', height: '0.8vh'} });
	game.addCollision({ spawnVw: {left: '21vw', top: '0vw'}, spawnVh: {left: '33.5vh', top: '0vh'}, sizeVw: {width: '39vw', height: '2vw'}, sizeVh: {width: '63vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '60vw', top: '0vw'}, spawnVh: {left: '97vh', top: '0vh'}, sizeVw: {width: '40vw', height: '2.5vw'}, sizeVh: {width: '63vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '52vw'}, spawnVh: {left: '0vh', top: '81vh'}, sizeVw: {width: '13vw', height: '11vw'}, sizeVh: {width: '17vh', height: '19.5vh'} });
	game.addCollision({ spawnVw: {left: '13vw', top: '61vw'}, spawnVh: {left: '17.5vh', top: '98vh'}, sizeVw: {width: '16vw', height: '1vw'}, sizeVh: {width: '30vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '29.5vw', top: '58vw'}, spawnVh: {left: '48vh', top: '92vh'}, sizeVw: {width: '11vw', height: '4vw'}, sizeVh: {width: '17vh', height: '8.5vh'} });
	game.addCollision({ spawnVw: {left: '80vw', top: '39.5vw'}, spawnVh: {left: '127vh', top: '63vh'}, sizeVw: {width: '20vw', height: '1vw'}, sizeVh: {width: '32vh', height: '1.5vh'} });
	game.addCollision({ spawnVw: {left: '87vw', top: '40.5vw'}, spawnVh: {left: '138vh', top: '64.5vh'}, sizeVw: {width: '13vw', height: '2vw'}, sizeVh: {width: '25vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '91vw', top: '42.5vw'}, spawnVh: {left: '144vh', top: '67vh'}, sizeVw: {width: '9vw', height: '2vw'}, sizeVh: {width: '19vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '95vw', top: '44.5vw'}, spawnVh: {left: '150vh', top: '69.5vh'}, sizeVw: {width: '5vw', height: '2vw'}, sizeVh: {width: '11vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '70vw', top: '44.5vw'}, spawnVh: {left: '112vh', top: '72vh'}, sizeVw: {width: '4vw', height: '3vw'}, sizeVh: {width: '7vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '69vw', top: '47.5vw'}, spawnVh: {left: '110vh', top: '76vh'}, sizeVw: {width: '10vw', height: '2vw'}, sizeVh: {width: '16vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '66vw', top: '49.5vw'}, spawnVh: {left: '106vh', top: '80vh'}, sizeVw: {width: '20vw', height: '3vw'}, sizeVh: {width: '32vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '66vw', top: '52.5vw'}, spawnVh: {left: '105vh', top: '85vh'}, sizeVw: {width: '25vw', height: '2vw'}, sizeVh: {width: '42vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '65vw', top: '54.5vw'}, spawnVh: {left: '103vh', top: '89vh'}, sizeVw: {width: '30vw', height: '2.5vw'}, sizeVh: {width: '53vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '56vw', top: '57vw'}, spawnVh: {left: '84vh', top: '94vh'}, sizeVw: {width: '44.5vw', height: '6vw'}, sizeVh: {width: '72vh', height: '6.5vh'} });

	game.addTrigger({ name: 'phaseTrigger', spawnVw: {right: '0', bottom: '0'}, spawnVh: {right: '0', bottom: '0'}, sizeVw: {width: '5.5vw', height: '12vw'}, sizeVh: {width: '8vh', height: '20vh'} });
}

function level4()
{
	$('#area').addClass('level4');
	$('#level').text('Nivel 4');

	$('.npc').each(function () {
		clearTimeout(animateTimeout[$(this).attr('id')]);
		$(this).remove();
	});

	$(player).data('items', '');

	$('.collision, .trigger').remove();

	game.setPlayer($('#player'), { spawnVw: {top: '47vw', left: '0'}, spawnVh: {top: '76vh', left: '0'} });

	game.addNPC({ spawnVw: {left: '50vw', top: '0vw'}, spawnVh: {left: '73.5vh', top: '0vh'}, destVw: {x: '60vw', y: '38vw'}, destVh: {x: '99.5vh', y: '59vh'}, customClass: 'deathknight', health: 200, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });
	game.addNPC({ spawnVw: {left: '56vw', top: '0vw'}, spawnVh: {left: '88.5vh', top: '0vh'}, destVw: {x: '52vw', y: '38vw'}, destVh: {x: '87.5vh', y: '59vh'}, customClass: 'deathknight', health: 200, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });
	game.addNPC({ spawnVw: {left: '35vw', top: '47vw'}, spawnVh: {left: '57vh', top: '76vh'}, destVw: {x: '82vw', y: '47vw'}, destVh: {x: '114.5vh', y: '76vh'}, customClass: 'deathknight', health: 200, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}] });
	game.addNPC({ spawnVw: {left: '38vw', top: '27vw'}, spawnVh: {left: '54vh', top: '38vh'}, customClass: 'orc', health: 300, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}, {item: 'potion', units: 1, text: 'Poción de sanación'}] });
	game.addNPC({ spawnVw: {left: '64vw', top: '18vw'}, spawnVh: {left: '101vh', top: '21vh'}, customClass: 'orc', health: 300, items: [{item: 'gold', units: 25, text: '25 monedas de oro'}, {item: 'key4', units: 1, text: 'Llave de acceso'}] });

	game.addCollision({ spawnVw: {left: '39vw', top: '57.5vw'}, spawnVh: {left: '62vh', top: '92.2vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '45vw', top: '39vw'}, spawnVh: {left: '72vh', top: '62vh'}, sizeVw: {width: '6vw', height: '1.5vw'}, sizeVh: {width: '9vh', height: '2.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '17vw'}, spawnVh: {left: '0vh', top: '27.5vh'}, sizeVw: {width: '31.5vw', height: '4.5vw'}, sizeVh: {width: '50.5vh', height: '6.5vh'} });
	game.addCollision({ spawnVw: {left: '35.5vw', top: '31vw'}, spawnVh: {left: '57vh', top: '49vh'}, sizeVw: {width: '8.5vw', height: '0.6vw'}, sizeVh: {width: '13vh', height: '1vh'} });
	game.addCollision({ spawnVw: {left: '28.5vw', top: '35.5vw'}, spawnVh: {left: '45vh', top: '57vh'}, sizeVw: {width: '2vw', height: '1.5vw'}, sizeVh: {width: '4vh', height: '2vh'} });
	game.addCollision({ spawnVw: {left: '73vw', top: '9vw'}, spawnVh: {left: '116.5vh', top: '14vh'}, sizeVw: {width: '29vw', height: '6.5vw'}, sizeVh: {width: '43.5vh', height: '9.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '21.5vw'}, spawnVh: {left: '0vh', top: '34vh'}, sizeVw: {width: '27vw', height: '4.5vw'}, sizeVh: {width: '43vh', height: '7.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '26vw'}, spawnVh: {left: '0vh', top: '42vh'}, sizeVw: {width: '22vw', height: '5.5vw'}, sizeVh: {width: '36vh', height: '8vh'} });
	game.addCollision({ spawnVw: {left: '74.5vw', top: '15.5vw'}, spawnVh: {left: '118vh', top: '24vh'}, sizeVw: {width: '26vw', height: '3.5vw'}, sizeVh: {width: '42vh', height: '7vh'} });
	game.addCollision({ spawnVw: {left: '80.2vw', top: '53.4vw'}, spawnVh: {left: '128vh', top: '85.5vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '44.3vw', top: '17.2vw'}, spawnVh: {left: '71vh', top: '28vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '66.5vw', top: '21.5vw'}, spawnVh: {left: '106vh', top: '34vh'}, sizeVw: {width: '5.5vw', height: '1.5vw'}, sizeVh: {width: '9vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '65.8vw', top: '8.4vw'}, spawnVh: {left: '105.2vh', top: '13.5vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '80.2vw', top: '34vw'}, spawnVh: {left: '128vh', top: '54.5vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '23.8vw', top: '40.7vw'}, spawnVh: {left: '38vh', top: '65vh'}, sizeVw: {width: '0.5vw', height: '0.2vw'}, sizeVh: {width: '1vh', height: '0.5vh'} });
	game.addCollision({ spawnVw: {left: '79vw', top: '22.5vw'}, spawnVh: {left: '127vh', top: '36vh'}, sizeVw: {width: '21.5vw', height: '2.5vw'}, sizeVh: {width: '32.5vh', height: '5vh'} });
	game.addCollision({ spawnVw: {left: '81.5vw', top: '25vw'}, spawnVh: {left: '131vh', top: '41vh'}, sizeVw: {width: '19vw', height: '3vw'}, sizeVh: {width: '28vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '76.5vw', top: '19vw'}, spawnVh: {left: '122.5vh', top: '31vh'}, sizeVw: {width: '23.5vw', height: '3.5vw'}, sizeVh: {width: '38vh', height: '5vh'} });
	game.addCollision({ spawnVw: {left: '84vw', top: '28vw'}, spawnVh: {left: '133.5vh', top: '45.8vh'}, sizeVw: {width: '16vw', height: '2.5vw'}, sizeVh: {width: '26vh', height: '3.8vh'} });
	game.addCollision({ spawnVw: {left: '71.5vw', top: '0vw'}, spawnVh: {left: '113.5vh', top: '0vh'}, sizeVw: {width: '29vw', height: '9vw'}, sizeVh: {width: '47vh', height: '13.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '0vw'}, spawnVh: {left: '0vh', top: '0vh'}, sizeVw: {width: '34vw', height: '17vw'}, sizeVh: {width: '55vh', height: '27.5vh'} });
	game.addCollision({ spawnVw: {left: '90vw', top: '59vw'}, spawnVh: {left: '143vh', top: '94vh'}, sizeVw: {width: '10vw', height: '3vw'}, sizeVh: {width: '17vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '89vw', top: '30.5vw'}, spawnVh: {left: '142vh', top: '50vh'}, sizeVw: {width: '16vw', height: '9vw'}, sizeVh: {width: '26vh', height: '13.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '31.5vw'}, spawnVh: {left: '0vh', top: '50vh'}, sizeVw: {width: '19vw', height: '2vw'}, sizeVh: {width: '32vh', height: '3.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '33.5vw'}, spawnVh: {left: '0vh', top: '54vh'}, sizeVw: {width: '15vw', height: '3vw'}, sizeVh: {width: '25vh', height: '4.5vh'} });
	game.addCollision({ spawnVw: {left: '0vw', top: '36.5vw'}, spawnVh: {left: '0vh', top: '59vh'}, sizeVw: {width: '7vw', height: '3vw'}, sizeVh: {width: '11vh', height: '4.5vh'} });

	game.addTrigger({ name: 'phaseTrigger', spawnVw: {right: '0', bottom: '0'}, spawnVh: {right: '0', bottom: '17vh'}, sizeVw: {width: '5.5vw', height: '18vw'}, sizeVh: {width: '8vh', height: '20vh'} });
}

function start()
{
	$('#startMenu').fadeOut();
	$(player).show();
	timeInterval = setInterval(updateTimer, 1000);
}

function complete()
{
	clearInterval(timeInterval);
	$('#endMenu').removeClass('hidden');

	$('.npc').each(function () {
		clearTimeout(animateTimeout[$(this).attr('id')]);
		$(this).remove();
	});
}

function restartLevel()
{
	if (currentLevel == 1)
		level1();
	else if (currentLevel == 2)
		level2();
	else if (currentLevel == 3)
		level3();
	else if (currentLevel == 4)
		level4();

	timer = timeLimit + 1;
	updateTimer();
}

function updateTimer()
{
	if (timer > 0)
	{
		timer--;
		let mins = Math.floor(timer / 60);
		let secs = timer - (mins * 60);

		if (mins < 10) mins = '0'+mins;
		if (secs < 10) secs = '0'+secs;

		if (timer < 10)
			$('#timer').css('color', '#d71d1d');
		else
			$('#timer').css('color', '#ffffff');

		$('#time-bar').progressbar({value: timer, max: timeLimit});
		$('#timer').html(mins+':'+secs);
	}
	else
	{
		clearInterval(timeInterval);
		$('#player').kill();	
	}
}


function animateSprite(elem, x, y, size, steps, fps, loop)
{
	let animation = $(elem).data('animation');

	if (animation != "")
	{
		let currentX = parseInt($(elem).css('background-position-x'));
		let currentY = parseInt($(elem).css('background-position-y'));
        let maxY = size * steps - y;

        currentY -= size;

        if (currentY <= -maxY && loop)
            currentY = y;

        $(elem).css('background-position-x', x+'px');
        $(elem).css('background-position-y', currentY+'px');

        if (currentY > -maxY)
    		animateTimeout[$(elem).attr('id')] = setTimeout(function() { animateSprite(elem, x, y, size, steps, fps, loop); }, 1000 / fps);
    }
    else
    {
    	$(elem).css('background-position-y', '0px');
    }
}


/************************************* Recoger Objectos *************************************/
$('.loot-items').on('click', '.item', function(e)
{
	if ($(this).data('item') == 'gold')
	{
		score += $(this).data('units');
		$('#score span').text(score);
	}
	else if ($(this).data('item') == 'potion')
		$(player).setHealth(100);

	let enemy = $(this).closest('.npc');
	let params = $(enemy).data('params');
	let drops = params.items.slice();

	let playerItems = [];

	if ($(player).data('items'))
		playerItems = $(player).data('items');

	for (let i=0; i<params.items.length; i++)
	{
		if ($(this).data('id') == params.items[i].id)
		{
			playerItems.push(params.items[i]);
			drops.splice(i, 1);
		}
	}
	params.items = drops;

	$(player).data('items', playerItems);
	$(enemy).data('params', params);
	$(this).remove();

	if ($('.item').length == 0)
	{
		$('.loot-items').dialog('close');
		setTimeout(function () { $('.loot-items').dialog('destroy'); }, 100);
		$(enemy).removeClass('lootable');
	}
});

$('#area').on("contextmenu", function(e)
{
	if ($(e.target).is('.npc.dead.lootable'))
	{
		$('.loot-items').dialog(
		{
			modal: true,
			width: 180,
			height: 244,
			dialogClass: "loot-ui",
			appendTo: $(e.target),
			resizable: false,
			position: { my: "left top", at: "left bottom", of: e.target },
			hide: 'fade'
		});

		let drops = $(e.target).data('params').items;
		$('.loot-items .item').remove();

		for (let i=0; i<drops.length; i++)
		{
			let item = $('<div class="item"><div class="icon"></div><div class="text">'+drops[i].text+'</div></div>');
			$(item).find('.icon').css({'background-image': "url(images/"+drops[i].item+".jpg)"});
			$(item).data({id: i, item: drops[i].item, units: drops[i].units});
			drops[i].id = i;
			$('.loot-items').append(item);
		}
	}

    return false;
});
/************************************* Fin Recoger Objectos *************************************/


$('#area').click(function(e) {
	$('.target').remove();
});


function floatingMessage(msg)
{
	clearTimeout(msgTimeout);
	let div = $('.floatingMsg').text(msg).show();
	msgTimeout = setTimeout(function () { $('.floatingMsg').fadeOut(); }, 5000);
}

function alertBox(msg, btnText, func)
{
	$('.alert .btn').text(btnText).unbind('click').click(function () { $('.alert').hide(); func(); });
	$('.alert p').text(msg);
	$('.alert').show();
}
