//console.log('Lay not up for yourselves treasures upon earth, where moth and rust doth corrupt, and where thieves break through and steal: But lay up for yourselves treasures in heaven, where neither moth nor rust doth corrupt, and where thieves do not break through nor steal: For where your treasure is, there will your heart be also. \n\n\t\t—Matthew 6:19–21');

// configuration
var gameConfig = {
  'duration': 30000,
  'presentation': false,
  'ghost': false,
  'ticker': false,
  'gameid': false,
  'stats': true,
  'alwaysUseServer': false,
  'autoplay': false,
  'playable': true,
  'logging': false,
  'replay': false,
  'saveServer': 'chartGame',
  'readServer': 'chartGame',
  'readServerLimit': 1000
}

// all config vars are configurable by query string on localhost;
// otherwise only ticker, gameid, and replay
if(window.location.hostname === 'localhost') {
  Object.keys(gameConfig).forEach(function(key) {
    var q = getQueryVariable(key);
    if(q === 'true') {
      gameConfig[key] = true;
    } else if(q === 'false') {
      gameConfig[key] = false;
    } else if(q) {
      gameConfig[key] = q;
    }
  })
} else {
  gameConfig.ticker = getQueryVariable('ticker');
  gameConfig.gameid = getQueryVariable('gameid');
  gameConfig.replay = getQueryVariable('replay') === 'true' ? true : false;
}
var isTerminal = false;
if(gameConfig.replay) {
  gameConfig.duration = 15000;
  gameConfig.presentation = true;
  gameConfig.ghost = true;
  gameConfig.playable = false;
}

d3.select("body").classed("presentation", gameConfig.presentation);

// set of levels available
var tickers = [
  {
    "ticker": "aapl",
    "name": "AAPL US Equity"
  },
  {
    "ticker": "dell",
    "name": "DELL US Equity"
  }/*,
  {
    "ticker": "nflx",
    "name": "NFLX US Equity"
  },
  {
    "ticker": "tsla",
    "name": "TSLA US Equity"
  },
  {
    "ticker": "brkb",
    "name": "BRK/B US Equity"
  },
  {
    "ticker": "mcz",
    "name": "MCZ US Equity"
  },
  {
    "ticker": "pg",
    "name": "PG US Equity"
  },
  {
    "ticker": "ene",
    "name": "Enron US Equity"
  },
  {
    "ticker": "znga",
    "name": "ZNGA US Equity"
  },
  {
    "ticker": "ge",
    "name": "GE US Equity"
  },
  {
    "ticker": "coke",
    "name": "COKE US Equity"
  },
  {
    "ticker": "googl",
    "name": "GOOGL US Equity"
  },
  {
    "ticker": "cat",
    "name": "CAT US Equity"
  },

  // second batch

  {
    "ticker": "glen",
    "name": "GLEN LN Equity"
  },
  {
    "ticker": "mcd",
    "name": "MCD US Equity"
  },
  {
    "ticker": "dd",
    "name": "DuPont US Equity"
  },
  {
    "ticker": "xom",
    "name": "XOM US Equity"
  },
  {
    "ticker": "1788",
    "name": "1788 HK (Guotai Junan)",
    "description": "On Nov. 23, Guotai Junan announced its CEO was missing and could not be reached. http://www.bloomberg.com/news/articles/2015-11-23/guotai-junan-international-says-chairman-yim-can-t-be-contacted"
  },
  {
    "ticker": "cag",
    "name": "CAG US Equity"
  },
  {
    "ticker": "f",
    "name": "F US Equity"
  },
  {
    "ticker": "corn",
    "name": "CORN US Equity"
  },
  {
    "ticker": "gpro",
    "name": "GPRO US Equity"
  },
  {
    "ticker": "yhoo",
    "name": "YHOO US Equity"
  },
  {
    "ticker": "lulu",
    "name": "LULU (Lululemon)"
  },
  {
    "ticker": "hal",
    "name": "HAL (Halliburton)"
  },
  {
    "ticker": "swhc",
    "name": "SWHC (Smith & Wesson)"
  },
  {
    "ticker": "kbio",
    "name": "KBIO (KaloBios)"
  },
  {
    "ticker": "cmg",
    "name": "CMG (Chipotle)"
  },
  {
    "ticker": "bks",
    "name": "BKS (Barnes & Noble)"
  },
  {
    "ticker": "gs",
    "name": "GS (Goldman Sachs)"
  },
  {
    "ticker": "dis",
    "name": "DIS (Disney)"
  },

  {
    "ticker": "fed",
    "name": "SPX (Fed liftoff)"
  },

  {
    "ticker": "hsi",
    "name": "HSI (Hang Seng Index)"
  },
  {
    "ticker": "shcomp",
    "name": "SHCOMP (Shanghai Composite)"
  }
*/
];

// UNUSED
/*
  {
    "ticker": "ibm", // shitty
    "name": "IBM US Equity"
  },
  {
    "ticker": "jpm",
    "name": "JPM US Equity"
  },
  {
    "ticker": "rtn",
    "name": "RTN US Equity",
    "description": "The previous day, SpaceX's rocket blew up. Not that it really mattered to Raytheon."
  },
  {
    "ticker": "grpn",  // way too flat intraday
    "name": "GRPN US Equity"
  },
  {
    "ticker": "7974",
    "name": "7974 JT Equity (Nintendo)",
    "description": "https://twitter.com/DavidInglesTV/status/659549109410332672"
  },
*/

tickers = _.shuffle(tickers);

var cash = 500;
var cashLiquid = true;
var levelNumber = 0;

var userId = Math.random().toString().split(".")[1];
var userHistory = {};

// persist userId and cash and userHistory
if(typeof(Storage) !== "undefined") {
  if(!localStorage.getItem("userId")) {
    try {
      localStorage.setItem("userId", userId);
    } catch(e) {
      console.error(e);
    }
  } else {
    userId = localStorage.getItem("userId");
  }

  if(!localStorage.getItem("cash")) {
    try {
      localStorage.setItem("cash", cash);
    } catch(e) {
      console.error(e);
    }
  } else {
    cash = localStorage.getItem("cash");
  }

  if(!localStorage.getItem("userHistory")) {
    try {
      localStorage.setItem("userHistory", JSON.stringify(userHistory));
    } catch(e) {
      console.error(e);
    }
  } else {
    userHistory = JSON.parse(localStorage.getItem("userHistory"));
  }
}
window.onunload = window.onbeforeunload = function() {
  localStorage.setItem("cash", cash);
  localStorage.setItem("userHistory", JSON.stringify(userHistory));
};

var indexFund;

var analysisStats = [];
var cashRules = [];

var tips = [
  "Premi e tieni premuto in qualsiasi punto sul grafico per comprare.",
  "Mantieni premuto per mantenere la posizione del titolo e rilascia per vendere.",
  "Il trascinamento non ha alcun effetto. L'unico controllo è quello del tempo."
];

var taglines = [
  "Buy Low Sell High",
  "So You Think You Can Trade?",
  "America’s Next Top Trader",
  "Portrait of the Chartist as a Young Man",
  "Get Rich Quick!",
  "Terminal Professional Service Lite",
  "Crushing Stock Saga",
  "Flappy Stock",
  "Uncharted 5",
  "li’l charts",
  "The Big Long"
];

initCanvas();

// gets s&p, then calls init
getIndexFund();

function getIndexFund() {
  d3.csv("spx.csv", function(error, data) {

    // more minimal version of processData below...
    var parseDate = d3.time.format("%x").parse;
    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.price = +d.price;
    });
    data.sort(function(a,b) {
      return a.date - b.date;
    });
    indexFund = {
      "ticker": "spx",
      "name": "SPX",
      "values": data
    }

    // ready to go
    init();
  });
}

function init() {
  
  var isTerminal = false;
  // find ticker specified in hash, if any
  var tickerIndex = tickers.map(function(d) { return d.ticker; }).indexOf(gameConfig.ticker);

  var buttonText = gameConfig.replay ? "Watch" : "Play";

  // FED LIFTOFF HACK
  if(gameConfig.ticker) buttonText += " " + gameConfig.ticker.toUpperCase()
  //if(gameConfig.ticker && tickerIndex > -1) buttonText += " " + tickers[tickerIndex].name;

  if(gameConfig.gameid) buttonText += " challenge";
  window.dvzqueue = queue;
  d3.select(".opener")
    .select("button")
    .text(buttonText)
    .on("click", getNextLevel)
    .on("touchstart", function(d) { d3.select(this).classed("hover", true); })
    .on("touchend", function(d) { d3.select(this).classed("hover", false); });

  d3.select(".opener h3").text(_.sample(taglines));

  if(gameConfig.autoplay) getNextLevel();
}

function getNextLevel() {
  levelNumber++;

  // this function is only called by "next" buttons, so... loading indicators!
  d3.select(this).text("...");

  d3.select('#full-header').classed('hidden', true);

  // find ticker specified in hash, if any
  var tickerIndex = tickers.map(function(d) { return d.ticker; }).indexOf(gameConfig.ticker);

  if(gameConfig.ticker && tickerIndex !== -1) {
    // load level specified in hash
    loadTicker(tickers.splice(tickerIndex,1)[0]);
  }
  //else if(!isTerminal && innerWidth <= 1060 && levelNumber % 6 == 3) {
  //   loadAd();
  // }
  else if(tickers.length) {
    loadTicker(tickers.pop());
  } else {
    // no more levels
    gameOver();
  }
}

// load ad
function loadAd() {

  var i = d3.select(".levels").selectAll(".ad-item").size();

  var adWrapper = d3.select(".levels")
    .append("div.ad-item")
    .style("z-index", d3.selectAll(".levels > div").size());

  adWrapper.append("div.toolbar")
    .append("button.next")
    .text("Next")
    .on("click", getNextLevel)
    .on("touchstart", function(d) { d3.select(this).classed("hover", true); })
    .on("touchend", function(d) { d3.select(this).classed("hover", false); });

  adWrapper.append("p").text("Advertisement");

  var ad = adWrapper.append("div.ad");

  // get intended size from data attribute
  // e.g. <div class="bannerad-sized" data-size="728,90"></div>
  // fall back to widest IAB size that fits container
  var size = ad.node().dataset.size ? ad.node().dataset.size.split(",") : getBestAdSize(ad.node());

  var new_leader = '<iframe width="' + size[0] + '" height="' + size[1] +
      '" id="lb_ad_frame" style="visibility:hidden;"' +
      'onload="this.style.visibility=' + "'visible'" +
      '" class="ad_frame" scrolling="no" frameborder="no" src="' +
      'http://www.bloomberg.com/graphics/assets/ad.html?url=/' + config.bb_slug +
      "&size=" + size[0] + "x" + size[1] + "|1x1&iu=" + config.ad_code + "&correlator=" + config.correlator;
  ad.node().style.display = "block";
  var randValue = new String(Math.random()).substring(2,11);
  var n = i + 1;
  ad.node().innerHTML = new_leader + '&position=box' + n + '&ord=' + randValue + '"></iframe>';

}

// load file
function loadTicker(ticker) {
  var qu = window.dvzqueue();
  qu.defer(d3.csv, ticker.ticker + ".csv");

  if(gameConfig.ghost) {
    qu.defer(getTrades, ticker.ticker, undefined);
  } else if(ticker.ticker === gameConfig.ticker && gameConfig.gameid) {
    qu.defer(getTrades, ticker.ticker, gameConfig.gameid);
  }

  qu.awaitAll(function(err, data) {

    var stock = processData(ticker, data[0]);

    if(data.length > 1) {
      stock.competitor = data[1];
      stock.competitor.trades.forEach(function(d,i) {
        d.final = d[1];
      });
      stock.competitor.gameid = gameConfig.ghost ? "ghost" : +gameConfig.gameid;
    }

    /// uhhhhh "GARBAGE COLLECTION" : )
    d3.selectAll(".levels .chart-item").remove();

    d3.select(".levels")
      .style("z-index", "2")
      .append("div.chart-item")
      .style("z-index", d3.selectAll(".levels > div").size())
      .datum(stock)
      .call(playLevel);
  });

}

// process data
function processData(stock, data) {

  // console.log(stock.ticker);

  // normalize length
  data = data.slice(0,500);

  // most are mm/dd/yyyy...
  var parseDate = d3.time.format("%x").parse;
  // but, uh, some are mm/dd/yyyy hh:mm:ss (24-hr) :-/
  if(data[0].date.split(" ").length == 2) {
    parseDate = d3.time.format("%x %X").parse;
  }

  data.forEach(function(d) {
    d.date = parseDate(d.date);
    d.price = +d.price;
  });

  data.sort(function(a,b) {
    return a.date - b.date;
  });

  data.forEach(getStdev, data);
  // data.forEach(getStdev2, data);

  var t0 = _.min(data, ƒ('date'));
  var t1 = _.max(data, ƒ('date'));
  var stockReturn = (t1.price - t0.price) / t0.price;

  if(indexFund) {
    var spxt0 = closest(ƒ('date'))(indexFund.values, t0.date);
    var spxt1 = closest(ƒ('date'))(indexFund.values, t1.date);
    var indexReturn = (spxt1.price - spxt0.price) / spxt0.price;
  }

  return {
    "ticker": stock.ticker,
    "name": stock.name,
    "values": data,
    "getSmoothDomain": getSmoothDomainFunction(data),
    "period": Math.min(data[1].date - data[0].date, data[2].date - data[1].date),
    "trades": [],
    "cash": [],
    "stockReturn": stockReturn,
    "indexReturn": indexReturn ? indexReturn : stockReturn,
    "traderReturn": null,
    "sharesHeld": 0,
    "challengeUrl": window.location.href
  };
}

// render
function playLevel(selection) {
  selection.each(function(stock) {

    var item = d3.select(this),
        margin = {top: 50, right: 40, bottom: 20, left: 0},
        width = this.offsetWidth - margin.left - margin.right,
        height = this.offsetHeight - margin.top - margin.bottom,
        duration = gameConfig.duration,
        timeframe = stock.period * (width / 8),
        timeBounds,
        priceBounds,
        latest;

    stock.cash.push({
      "date": d3.min(stock.values, ƒ('date')),
      "cash": cash
    });

    // DEBUG
    // if(gameConfig.presentation) {
    //   margin.top = 5;
    //   height = this.offsetHeight - margin.top - margin.bottom;
    // }
    // console.log(stock);
    // console.log(stock.ticker, stock.values.length, stock.period / (24 * 60 * 60 * 1000))
    // console.log(d3.mean(stock.values.map(ƒ('σ'))));
    // console.log(stock.period / (24 * 60 * 60 * 1000));
    // END DEBUG

    var showTipThrottled = _.throttle(showTip, 5000, {leading: false});

    var dollarFormat = d3.format('$,.2f');
    var dollarFormat0 = d3.format('$,.0f');
    var percentFormat = d3.format(".1%");
    var percentFormat0 = d3.format(".0%");

    var xTickScale = d3.scale.linear()
        .domain([320, 1280])
        .range([4,10]);

    var colorScale = d3.scale.linear()
        .domain([-.01,.01])
        .range(["#ff0000", "#00ff00"])
        .clamp(true);

    var iconNumberScale = d3.scale.log()
        .domain([.1,1000000])
        .range([1,10]);

    var x = d3.time.scale()
        .domain([
          d3.min(stock.values, ƒ('date')),
          d3.min(stock.values, ƒ('date'))
        ])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain(d3.extent(stock.values, ƒ('price')))
        .range([height, 0]);

    var tScale = d3.time.scale()
        .domain(d3.extent(stock.values, ƒ('date')))
        .range([0,duration]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .ticks(xTickScale(width))
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("right")
        .tickFormat(d3.format("$"));

    var gridlines = d3.svg.axis()
        .scale(y)
        .tickSize(-width, 0)
        .tickValues(gridlineTicks)
        .orient("left");

    var stepLine = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price); })
        .interpolate("step-after");

    var stepArea = d3.svg.area()
        .x(function(d) { return x(d.date); })
        .y0(y.range()[0])
        .y1(function(d) { return y(d.price); })
        .interpolate("step-after");

    var line = d3.svg.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.price); });

    // DOM-building begins here

    var toolbar = item.append("div.toolbar");
    var alerts = item.append("div.alerts");

    var timeLabel = toolbar.append("div.time").text(timerFormat(duration));
    var cashHolder = toolbar.append("div.cash");
    var cashLabel = cashHolder.append("span.net").text(dollarFormat(cash));
    var cashChange = cashHolder.append("div.change");
    var tickerLabel = toolbar.append("div.ticker").text(stock.name).style("display", "none");
    if(gameConfig.replay) tickerLabel.style("display", "");

    var svg = item.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var clipPath = svg.append("clipPath")
        .attr("id", "plot-area-clip")
      .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    var gridlinesG = svg.append("g")
        .attr("class", "gridlines axis")
        .call(gridlines);

    var xAxisG = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    var yAxisG = svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + "," + 0 + ")")
        .call(yAxis);

    var lineArea = svg.append("path")
        .datum(stock.values)
        .attr("class", "area")
        .attr("clip-path", "url(#plot-area-clip)")
        .attr("d", stepArea);

    var linePath = svg.append("path")
        .datum(stock.values)
        .attr("class", "line share")
        .attr("clip-path", "url(#plot-area-clip)")
        .attr("d", stepLine);

    var yMark = svg.append("g.y-mark")
        .attr("transform", "translate(" + (width + 3) + "," + 0 + ")");
    yMark.append("path")
        .attr("d", d3.svg.symbol().type("triangle-up").size(30))
        .style("transform", "rotate(-90deg)")
        .style("fill", "#fff");
    yMark.append("image")
        .attr("xlink:href","certificate-white.png")
        .attr("width", 18)
        .attr("height", 12)
        .attr("x", 6)
        .attr("y", -6);

    svg.append("circle.cursor-indicator")
      .attr("cx", "50")
      .attr("cy", "50")
      .attr("r", 1e-6);

    tick(0);
    startLevel();

    //////////////////////////////////////////////

    function startLevel() {

      item.classed("playing", true);
      d3.select("body").classed("playing", true);

      if(gameConfig.playable) {
        var dragger = d3.behavior.drag()
          .on("dragstart", dragstart)
          .on("drag", drag)
          .on("dragend", dragend);

        item
          .call(dragger)
          .on("mousemove.cursor", mousemove);
      }

      d3.timer(tick);
    }

    function tick(t) {

      // level is over
      if(t > tScale.range()[1]) {
        // liquidate any remaining shares
        dragend();
        // unbind trade listeners
        item.on(".drag", null);
        item.on(".cursor", null);
      }

      // heyo adaptive feedback!
      if(!(d3.max(stock.trades, function(d) { return tScale(d[1].date) - tScale(d[0].date); }) > 500)) {
        showTipThrottled();
      }

      timeBounds = [new Date(+tScale.invert(t) - timeframe), tScale.invert(t)];
      priceBounds = stock.getSmoothDomain(tScale.invert(t));

      x.domain(timeBounds);
      y.domain(priceBounds);

      xAxisG.call(xAxis);
      yAxisG.call(yAxis);
      gridlinesG.call(gridlines);
      linePath.attr("d", stepLine);
      lineArea.attr("d", stepArea);

      var boundedData = stock.values.filter(function(d) { return d.date > timeBounds[0] && d.date <= timeBounds[1]; });
      if(boundedData.length) {
        latest = _.max(boundedData, function(d) { return d.date; });
      }
      if(!cashLiquid) {
        cash = latest.price * stock.sharesHeld;
      }

      stock.trades.filter(function(d) { return d.outstanding; }).forEach(function(d) {
        d[1] = {
          "date": timeBounds[1],
          "price": latest.price
        };
      });

      yMark.attr("transform", "translate(" + (width + 3) + "," + y(latest.price) + ")");

      svg.selectAll("path.transaction.live")
        .data(stock.trades)
        .enter()
        .append("path.transaction.live");

      svg.selectAll("path.transaction.live")
        .attr("d", line)
        .classed("outstanding", ƒ('outstanding'))
        .style("stroke", function(d) { return colorScale( d[1].price - d[0].price )});

      cashLabel.text(dollarFormat(cash))
        .classed("liquid", cashLiquid);
      timeLabel.text(timerFormat(duration-t));

      if(stock.competitor) {

        var ghostTrades = stock.competitor.trades
          .slice(0,1500)
          .filter(function(d,i) {
            return d[0].date < timeBounds[1];
          });
        ghostTrades.forEach(function(d,i) {
          if (d.final.date < timeBounds[1]) {
            // use final data
            d[1] = d.final;
          } else {
            // trade is outstanding;
            // use then-latest data
            d[1] = {
              "date": timeBounds[1],
              "price": latest.price
            };
          }
        });

        svg.selectAll("path.transaction.competitor")
          .data(ghostTrades)
          .enter()
          .append("path.transaction.competitor")
          .classed("ghost", stock.competitor.trades.length > 100);

        svg.selectAll("path.transaction.competitor")
          .attr("d", line)
          .style("stroke", function(d) { return colorScale(d[1].price - d[0].price); });
      }

      // level is over, pt. 2 :-/
      if(t > tScale.range()[1]) {
        return levelOver();
      };

    }

    function dragstart() {

      // stock is already being traded.
      // sloppy hack away from per-share trading...
      if(!cashLiquid) return;
      cashLiquid = false;

      item.classed("holding", true);

      var point = d3.mouse(svg.node());

      stock.sharesHeld = cash / latest.price;

      var trade = [
        {
          "date": timeBounds[1],
          "price": latest.price
        },
        {
          "date": timeBounds[1],
          "price": latest.price
        }
      ];
      trade.outstanding = true;
      trade.id = Math.random().toString().split(".")[1];

      stock.trades.push(trade);
/*
      svg.selectAll("text.dollabill.id"+trade.id)
        .data(d3.range(Math.round(iconNumberScale(trade[0].price * stock.sharesHeld))))
        .enter()
        .append("text.dollabill.id"+trade.id)
        .text("$")
        .attr("x", function(d,i) { return Math.random() * 30 - 15; })
        .attr("y", function(d,i) { return Math.random() * 30 - 15; })
        .transition()
        .duration(500)
        .delay(function(d,i) { return 10*i; })
        .ease("linear")
        .attr("x", x(trade[0].date))
        .attr("y", y(trade[0].price))
        .remove();
      svg.selectAll("image.shareicon.id"+trade.id)
        .data(d3.range(Math.round(iconNumberScale(stock.sharesHeld))))
        .enter()
        .append("image.shareicon.id"+trade.id)
        .attr("xlink:href","certificate-white.png")
        .attr("width", 18)
        .attr("height", 12)
        .attr("x", function(d,i) { return x(trade[0].date) + (Math.random() * 30 - 15); })
        .attr("y", function(d,i) { return y(trade[0].price) + (Math.random() * 30 - 15); })
        .transition()
        .duration(500)
        .delay(function(d,i) { return 20*i; })
        .ease("linear")
        .attr("x", point[0])
        .attr("y", point[1])
        .remove();
*/
      svg.select(".cursor-indicator")
        .attr("cx", point[0])
        .attr("cy", point[1])
        .transition()
        .duration(250)
        .attr("r", "50");

    }

    function drag() {

      var point = d3.mouse(svg.node());

      svg.select(".cursor-indicator")
        .attr("cx", point[0])
        .attr("cy", point[1]);
    }

    function mousemove() {
      if(!cashLiquid) return;
      svg.select(".cursor-indicator")
        .attr("cx", d3.mouse(svg.node())[0])
        .attr("cy", d3.mouse(svg.node())[1])
        .transition()
        .duration(250)
        .attr("r", 5);
    }

    function dragend() {

      item.classed("holding", false);

      // liquidate any outstanding transactions
      var outstandingTransactions = stock.trades.filter(function(d) {
        return d.outstanding;
      });
      outstandingTransactions.forEach(function(d) {
        d.outstanding = false;

        cash = d[1].price * stock.sharesHeld;

        // terrible hacky thing for zero-duration trades
        // cf. https://github.com/bizweekgraphics/stock-chart-game/issues/31
        if(d[1].date - d[0].date) {
          cashChangeValue = (d[1].price - d[0].price) * stock.sharesHeld;
          cashChange.text(dollarFormat(cashChangeValue))
            .style("color", colorScale(cashChangeValue))
            .style("opacity", 1)
            .transition()
            .duration(1000)
            .style("opacity", 0);
        }
/*
        svg.selectAll("text.dollabill.id"+d.id)
          .data(d3.range(Math.round(iconNumberScale(d[0].price * stock.sharesHeld))))
          .enter()
          .append("text.dollabill.id"+d.id)
          .text("$")
          .attr("x", x(d[1].date))
          .attr("y", y(d[1].price));
        svg.selectAll("text.dollabill.id"+d.id).transition()
          .duration(500)
          .delay(function(d,i) { return 10*i; })
          .ease("linear")
          .attr("x", function(d,i) { return Math.random() * 30 - 15; })
          .attr("y", function(d,i) { return Math.random() * 30 - 15; })
          .remove();
        svg.selectAll("image.shareicon.id"+d.id)
          .data(d3.range(Math.round(iconNumberScale(stock.sharesHeld))))
          .enter()
          .append("image.shareicon.id"+d.id)
          .attr("xlink:href","certificate-white.png")
          .attr("width", 18)
          .attr("height", 12)
          .attr("x", d3.select(".cursor-indicator").attr("cx"))
          .attr("y", d3.select(".cursor-indicator").attr("cy"));
        svg.selectAll("image.shareicon.id"+d.id).transition()
          .duration(500)
          .delay(function(d,i) { return 20*i; })
          .ease("linear")
          .attr("x", function() { return x(d[1].date) + (Math.random() * 30 - 15); })
          .attr("y", function() { return y(d[1].price) + (Math.random() * 30 - 15); })
          .remove();
*/
        svg.select(".cursor-indicator")
          .transition()
          .duration(250)
          .attr("r", 1e-6);

        stock.sharesHeld = 0;
        cashLiquid = true;

      });

    }

    function levelOver() {
      item.classed("playing", false);
      d3.select("body").classed("playing", false);
      item.classed("level-over", true);

      d3.select('meta[property="og:longTitle"]').attr("content", "I’ve made " + dollarFormat0(cash)
        + " playing the @business Trading Game. Can you beat the market? Play now:");

      tickerLabel.style("display", "");

      svg.select(".cursor-indicator")
        .transition()
        .attr("r", 1e-6);

      x.domain(d3.extent(stock.values, ƒ('date')));

      // fed liftoff hack
      if( d3.max(stock.values, ƒ('price')) > 1000 ) {
        y.domain(d3.extent(stock.values, ƒ('price')));
      } else {
        y.domain([0, d3.max(stock.values, ƒ('price'))]);
      }

      var transition = svg.transition()
        .delay(250)
        .duration(1000);

      transition.select(".x.axis").call(xAxis);
      transition.select(".y.axis").call(yAxis);
      transition.select(".gridlines.axis").call(gridlines);

      transition.select("path.line.share")
        .attr("d", function(d) { return stepLine(stock.values); });

      transition.select("path.area")
        .attr("d", function(d) { return stepArea(stock.values); });

      transition.selectAll("path.transaction")
        .attr("d", line);

      transition.select(".y-mark")
        .attr("transform", "translate(" + (width + 3) + "," + y(latest.price) + ")")
        .style("opacity", 0);

      // button to advance
      toolbar.append("button.next")
        .text("Next")
        .on("click", getNextLevel)
        .on("touchstart", function(d) { d3.select(this).classed("hover", true); })
        .on("touchend", function(d) { d3.select(this).classed("hover", false); });

      // update stock properties
      stock.cash.push({
        "date": d3.max(stock.values, ƒ('date')),
        "cash": cash
      });
      stock.traderReturn = (stock.cash[1].cash - stock.cash[0].cash) / stock.cash[0].cash;

      if(userHistory[stock.ticker] && stock.traderReturn > userHistory[stock.ticker].highscore) {
        addAlert("Record personale !", true);
      }

      if(stock.competitor && stock.competitor.returns.length === 1) {
        if(stock.traderReturn > stock.competitor.returns[0]) {
          addAlert("You beat your challenger " + percentFormat0(stock.traderReturn) + " to " + percentFormat0(stock.competitor.returns[0]) + "!", true);
        } else {
          addAlert("You lost to your challenger, " + percentFormat0(stock.traderReturn) + " to " + percentFormat0(stock.competitor.returns[0]) + ".", true);
        }
      }

      // update user history
      if(userHistory[stock.ticker]) {
        userHistory[stock.ticker].attempts++;
        userHistory[stock.ticker].highscore = Math.max(userHistory[stock.ticker].highscore, stock.traderReturn)
      } else {
        userHistory[stock.ticker] = {
          "attempts": 1,
          "highscore": stock.traderReturn
        }
      }

      var alertText = "<p>La tua strategia ha reso il " + percentFormat(stock.traderReturn) + "</p>" +
        "<p>La strategia BUY&HOLD del titolo ha reso il " + percentFormat(stock.stockReturn) + "</p>" +
        "<p>La strategia BUY&HOLD dell'S&P500 ha reso il " + percentFormat(stock.indexReturn) + "</p>";

      addAlert(alertText, true);
      
// Commenta questo blocco per disabilitare il salvataggio
 /*
      if(gameConfig.playable) {
        saveTrades(stock, function(err, key) {

          stock.challengeUrl = window.location.protocol
            + "//"
            + window.location.host
            + window.location.pathname
            + '?ticker='+key.ticker + '&gameid=' + key.timestamp;

          // history.pushState(null, null, stock.challengeUrl);

          var alertText = 'Challenge someone to beat your score with this URL: <input value="' + stock.challengeUrl + '">';
          addAlert(alertText, true);
        });
      }
*/
      getTrades(stock.ticker, undefined, renderTrades);

      function renderTrades(err, result) {

        if(err) {
          console.log(err);
          return false;
        }

        if(window.innerWidth > 800 && !gameConfig.ghost) {
          svg.selectAll("path.transaction.past")
              .data(result.trades)
            .enter()
              .append("path.transaction.past")
              .attr("d", line)
              .style("stroke", function(d) { return colorScale(d[1].price - d[0].price); })
              .style("opacity", 0)
              .transition()
              .duration(1000)
              .delay(1000)
              .style("opacity", .05);
        }

        result.returns.sort(function(a,b){return a - b});
        var percentile = result.returns.length ? (d3.bisect(result.returns, stock.traderReturn) / result.returns.length) : 1;
        var rank = result.returns.length - d3.bisect(result.returns, stock.traderReturn) + 1;

        var performanceComments = [
          [0, "Being so bad takes skill."],
          [.25, "I suck!"],
          [.4, "That’s, like, almost average?"],
          [.45, "Perfectly average is a kind of perfect."],
          [.55, "Above average!"],
          [.8, "I should do this for real!"],
          [.9, "Wicked hella good!"],
          [.99, "Holy shit!!"]
        ];
        var performanceCommentsScale = d3.scale.threshold()
          .domain(performanceComments.map(ƒ(0)).slice(1))
          .range(performanceComments.map(ƒ(1)));

        var alertText = "You outperformed " + percentFormat(percentile)
          + " of players, ranking #" + rank + ". <span class='tweet'>Tweet</span>";
        var tweetText = "I beat " + percentFormat0(percentile)
          + " of people trading $" + stock.ticker.toUpperCase()
          + ", ranking #" + rank + ". "
          + performanceCommentsScale(percentile) + " The Trading Game:";
        addAlert(alertText, true, tweetText);

        if(gameConfig.stats) {

          var returnsAnnotations = [
            {"x": stock.stockReturn, "text": stock.ticker.toUpperCase()},
            {"x": stock.indexReturn, "text": "S&P"}
          ];

          if(gameConfig.playable) {
            returnsAnnotations.push({"x": stock.traderReturn, "text": "You"});
          }

          if(stock.competitor && stock.competitor.returns.length === 1) {
            returnsAnnotations.push({"x": stock.competitor.returns[0], "text": "Challenger"});
          }

          // console.log(stock.ticker + ': ' + JSON.stringify(result.returns.map(function(d) { return d.toPrecision(4); })));

          if(window.innerWidth > 500) {
            var returnsHistogram = histogram()
              .width(300)
              .height(75)
              .title('Returns')
              .annotations(returnsAnnotations);
            svg.append("g.histogram.returns")
              .attr("transform", "translate(" + (stock.stockReturn > -.2 ? 20 : (width-320)) + ",10)")
              .datum(result.returns)
              .call(returnsHistogram);

            var tradeHistogram = histogram()
              .x(x)
              .height(100);
            svg.append("g.histogram.trades")
              .attr("transform", "translate(0," + (height-100) + ")")
              .datum([].concat.apply([], result.trades).map(ƒ('date')))
              .call(tradeHistogram);
          }

          if(gameConfig.logging) {
            analysisStats.push({
              "stock ticker": stock.ticker,
              "start date": x.domain()[0],
              "end date": x.domain()[1],
              "stock return": stock.stockReturn,
              "stock deviation": getStdevProper(stock.values),
              "returns mean": d3.mean(result.returns),
              "returns deviation": d3.deviation(result.returns),
              "trades number": result.trades.length,
              "trades duration": d3.mean(result.trades.map(function(d) { return (d[1].date - d[0].date) / (x.domain()[1] - x.domain()[0]) })),
              "stock percentile": d3.bisect(result.returns, stock.stockReturn) / result.returns.length,
              "cash percentile": d3.bisect(result.returns, 0) / result.returns.length
            });
          }

        }

        if(gameConfig.autoplay) getNextLevel();
      }

      return true;
    }

    function gridlineTicks(d) {
      var gridTicks = [];
      var gridInterval = 10;
      for(var i = Math.ceil(y.domain()[0]/gridInterval); i <= Math.floor(y.domain()[1]/gridInterval); i++) {
        gridTicks.push(i*gridInterval);
      }
      return gridTicks;
    }

    function addAlert(string, stick, tweet) {
      var alert = alerts.append("div.alert")
        .html(string);

      if(!stick) {
        alert.transition()
          .delay(4000)
          .duration(500)
          .remove();
      }

      if(tweet) {
        alert.classed("tweetable", true)
          .on("click", function() { postToTwitter(stock.challengeUrl, tweet); });
      }

      alert.select("input").on("click", function() {
        this.setSelectionRange(0, this.value.length);
      })
    }

    function showTip() {
      if(tips.length) addAlert(tips.shift());
    }

  });
}

function gameOver() {
  d3.select('#full-header').classed('hidden', false);

  var gameOver = d3.select(".levels")
    .append("div.game-over")
    .style("z-index", d3.selectAll(".levels > div").size())

  var gameOverText = gameOver.append("div.center-middle");

  gameOverText.append("h2")
    .text("GAME OVER");

  gameOverText.append("p")
    .text("Reload per provare ancora.");

  initEnderCanvas(gameOver.append("canvas"));

  if(gameConfig.logging) {
    console.table(analysisStats);
    console.table(cashRules);
  }
}

////////////////////
// HELPERS AND STUFF

function getSmoothDomainFunction(data) {

  // simplify price
  // tolerance comes from price
  var dataSimple = simplify(data.map(function(d) {
    return {
      "x": +d.date,
      "y": d.price
    }
  }), d3.mean(data.map(ƒ('σ')))*1.5);
  var dataSimpleLine = dataSimple.map(function(d) {
    return {
      "date": new Date(d.x),
      "price": d.y
    }
  });
  // smooth price
  var smoothPath = Smooth(dataSimple.map(function(d) {
    return [d.x, d.y];
  }));

  // simply variance
  // tolerance is just... high. too much volatility in aperture is disorienting.
  var dataStdevSimple = simplify(data.map(function(d) {
    return {
      "x": +d.date,
      "y": d.σ
    }
  }), 30);
  var dataStdevSimpleLine = dataStdevSimple.map(function(d) {
    return {
      "date": new Date(d.x),
      "price": d.y
    }
  });
  // smooth variance
  var smoothStdevPath = Smooth(dataStdevSimple.map(function(d) {
    return [d.x, d.y];
  }));

  // example usage in situ: getSmoothDomain(tScale.invert(t));
  function getSmoothDomain(date) {
    // SMOOTH AND SIMPLIFY BOUNDS STUFF
    var bi = d3.bisect(dataSimpleLine.map(ƒ('date')), date);
    if(bi < dataSimpleLine.length) {
      var biPc = (+date - +dataSimpleLine[bi-1].date) / (+dataSimpleLine[bi].date - +dataSimpleLine[bi-1].date)
      // console.log("We are " + Math.round(biPc*100) + "% between " + dataSimpleLine[bi-1].date + " and " + dataSimpleLine[bi].date);
      var smoothPrice = smoothPath((bi-1) + biPc)[1];
    } else {
      var smoothPrice = smoothPath(bi)[1];
    }
    // END SMOOTH AND SIMPLIFY BOUNDS STUFF

    // SMOOTH AND SIMPLIFY VARIANCE STUFF
    var bi = d3.bisect(dataStdevSimpleLine.map(ƒ('date')), date);
    if(bi < dataStdevSimpleLine.length) {
      var biPc = (+date - +dataStdevSimpleLine[bi-1].date) / (+dataStdevSimpleLine[bi].date - +dataStdevSimpleLine[bi-1].date)
      var smoothStdev = smoothStdevPath((bi-1) + biPc)[1];
    } else {
      var smoothStdev = smoothStdevPath(bi)[1];
    }
    // END SMOOTH AND SIMPLIFY VARIANCE STUFF

    var aperture = smoothPrice * .2 + smoothStdev * 4; //original
    var aperture = smoothPrice * 0 + smoothStdev * 5; //for fed liftoff

    var domain = [
      Math.max(smoothPrice - aperture, 0),
      smoothPrice + aperture
    ];

    domain.price = smoothPrice;
    domain.stdev = smoothStdev;

    return domain;
  }

  getSmoothDomain.price = dataSimpleLine;
  getSmoothDomain.stdev = dataStdevSimpleLine;

  return getSmoothDomain;
}

function getStdev(d) {
  // compute from periodicity of data
  var period = Math.min(this[1].date - this[0].date, this[2].date - this[1].date);
  var varianceWindow = period * 90;

  // N.B. #BUG:
  // IF PERIODICITY IS SUFFICIENTLY BIMODAL,
  // there can be gaps greater than the varianceWindow,
  // which leads to this returning 'undefined' stdev,
  // which makes it unreliable when fed into smooth+simplify
  // for stocks with huge gaps relative to the granularity
  // (e.g. a week of 5-minute data w/ nights and weekends)

  var bounds = [
    new Date(+d.date - (.5 * varianceWindow)),
    new Date(+d.date + (.5 * varianceWindow))
  ];
  var boundedData = this.filter(function(dd) { return dd.date > bounds[0] && dd.date <= bounds[1]; });

  d.σ = d3.deviation(boundedData, ƒ('price'));
}

// calculate stdev from intraday returns
// http://www.investopedia.com/ask/answers/021015/how-can-you-calculate-volatility-excel.asp
function getStdevProper(values) {
  values.forEach(function(d, i) {
    if(i === 0) return;
    d.return = (d.price / values[i-1].price) - 1;
  })
  return d3.deviation(values, ƒ('return'));
}

function getStdev2(d) {
  // compute from periodicity of data
  var period = Math.min(this[1].date - this[0].date, this[2].date - this[1].date);
  var varianceWindow = period * 90;

  // N.B. #BUG:
  // IF PERIODICITY IS SUFFICIENTLY BIMODAL,
  // there can be gaps greater than the varianceWindow,
  // which leads to this returning 'undefined' stdev,
  // which makes it unreliable when fed into smooth+simplify
  // for stocks with huge gaps relative to the granularity
  // (e.g. a week of 5-minute data w/ nights and weekends)

  var bounds = [
    new Date(+d.date - (.5 * varianceWindow)),
    new Date(+d.date + (.5 * varianceWindow))
  ];
  var boundedData = this.filter(function(dd) { return dd.date > bounds[0] && dd.date <= bounds[1]; });

  boundedData.forEach(function(d, i) {
    if(i === 0) return;
    d.return = (d.price / boundedData[i-1].price) - 1;
  })

  d.σ2 = d3.deviation(boundedData, ƒ('return'));
}

function timerFormat(t) {
  var secondsFormat = d3.format('02');
  return (Math.ceil(t/1000) == 60 ? "1" : "") + ":" + secondsFormat(Math.abs(Math.ceil(t/1000) % 60));
}

// https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable) {
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

/////////
// CANVAS

function initCanvas() {
  var canvas = d3.select(".opener canvas");
  canvas.node().setAttribute('width', innerWidth);
  canvas.node().setAttribute('height', innerHeight);
  var ctx = canvas.node().getContext('2d');

  initStocks();

  function initStocks() {
    // n.b. hella clever random color http://www.paulirish.com/2009/random-hex-color-code-snippets/
    var stocks = d3.range(20).map(function(d) {
      return {
        "t": 0,
        "p": innerHeight * Math.random(),
        "color": '#'+Math.floor(Math.random()*16777215).toString(16)
      };
    });
    d3.timer(function(t) { return renderCanvas(t, stocks); });
  }

  function getPriceChange(stock) {
    var dp = (d3.random.logNormal(.5,1)() * -1 + 3) / 200;
    stock.p = stock.p + stock.p * dp;
  }

  function renderCanvas(t, stocks) {

    // if user has advanced, stop animation
    if(levelNumber > 0) return true;

    // if time is up, restart timer
    if(t/20 > innerWidth) {
      initStocks();
      return true;
    }

    stocks.forEach(function(d,i) {

      ctx.strokeStyle = d.color;

      if(d.p >= innerHeight) {
        d.p = innerHeight * Math.random();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(d.t/20, innerHeight - d.p);

      getPriceChange(d);
      d.t = t % (innerWidth*20);

      ctx.lineTo(d.t/20, innerHeight - d.p);
      ctx.stroke();

    })
  }
}

function initEnderCanvas(canvas) {
  var width = innerWidth;
  var height = innerHeight;
  canvas.node().setAttribute('width', width);
  canvas.node().setAttribute('height', height);
  var ctx = canvas.node().getContext('2d');

  initStocks();

  function initStocks() {
    // n.b. hella clever random color http://www.paulirish.com/2009/random-hex-color-code-snippets/
    var stocks = d3.range(20).map(function(d) {
      return {
        "t": 0,
        "p": Math.min(innerHeight, innerWidth) * Math.random() * .7,
        "offset": Math.PI * 2 * Math.random(),
        "color": '#'+Math.floor(Math.random()*16777215).toString(16)
      };
    });
    d3.timer(function(t) { return renderCanvas(t, stocks); });
  }

  function getPriceChange(stock) {
    var dp = (d3.random.logNormal(.5,1)() * -1 + 3) / 200;
    stock.p = stock.p + stock.p * dp;
  }

  function renderCanvas(t, stocks) {

    var timeToAngle = d3.scale.linear()
      .domain([0,5000])
      .range([0,Math.PI*2]);

    // if time is up, restart timer
    if(t/20 > innerWidth) {
      initStocks();
      return true;
    }

    stocks.forEach(function(d,i) {

      ctx.strokeStyle = d.color;

      // get r and theta from d.p and t
      var angle = timeToAngle(d.t) + d.offset;
      var radius = d.p;
      var cartX = radius * Math.cos(angle) + width/2;
      var cartY = radius * Math.sin(angle) + height/2;

      ctx.beginPath();
      ctx.moveTo(cartX, cartY);

      getPriceChange(d);
      d.t = t;

      var angle = timeToAngle(d.t) + d.offset;
      var radius = d.p;
      var cartX = radius * Math.cos(angle) + width/2;
      var cartY = radius * Math.sin(angle) + height/2;

      ctx.lineTo(cartX, cartY);
      ctx.stroke();

    })
  }
}

//////
// ADS

function getBestAdSize(container) {
  /*
  IAB ad unit nomenclature:
  ----------- ----------------
  300 × 250   Medium Rectangle
  180 × 150   Rectangle
  160 × 600   Wide Skyscraper
  728 × 90    Leaderboard
  ----------- ----------------
  http://www.iab.net/guidelines/508676/508767/UAP
  */
  var sizes = [[300,250],[180,150],[160,600],[728,90]];
  var eligibleSizes = sizes.filter(function(d) { return d[0] < container.offsetWidth; });
  var widestSize = _.max(eligibleSizes,function(d) { return d[0]; });
  return widestSize;
}

/////////
// SERVER

var lambda = false;
if(typeof AWS !== 'undefined' && !isTerminal) {
  lambda = new AWS.Lambda({
    region: "us-east-1",
    accessKeyId: "AKIAJG4MLF2YGY5XX7UA",
    secretAccessKey: "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"
  });
}

function saveTrades(stock, callback) {

  if(!lambda) {
    if(callback) callback.call(this, new Error("Lambda not defined; AWS failed us!"));
    return false;
  }

  var newItem = {
    "ticker": stock.ticker,
    "timestamp": +new Date(),
    "user": userId,
    "screen": [innerWidth, innerHeight],
    "competitor": stock.competitor ? stock.competitor.gameid : false,
    "attempts": userHistory[stock.ticker] ? userHistory[stock.ticker].attempts : false,
    "return": stock.traderReturn, // ".217"
    "cash": stock.cash, // [{date, cash}, {date, cash}]
    "trades": stock.trades // jsonification drops the .outstanding and .id array object props
  }

  var params = {
    "operation": "create",
    "Item": newItem
  }

  lambda.invoke({
    FunctionName: gameConfig.saveServer,
    Payload: JSON.stringify(params)
  }, function(err, data) {
    if (!err) {
      // result is currently an empty object, but hey
      var result = JSON.parse(data.Payload)

      // return a key to the thing just inserted
      var newKey = {
        "ticker": newItem.ticker,
        "timestamp": newItem.timestamp
      };

      if(callback) callback.call(this, undefined, newKey);
    } else {
      console.log("err: " + err);
      if(callback) callback.call(this, err, undefined);
    }

  });

}

function getTrades(ticker, timestamp, callback) {
  if(timestamp === undefined) {
    // get cached crowd trades, if available; fail over to AWS Lambda / Dynamo
    d3.json("data/leaderboards/" + ticker + ".json", function(error, data) {
      if(error || gameConfig.alwaysUseServer) {
        getTradesServer(ticker, undefined, callback);
      } else {
        data.trades.forEach(function(pair) {
          pair.forEach(function(endpoint) {
            endpoint.price = +endpoint.price;
            endpoint.date = new Date(endpoint.date);
          })
        });
        callback(error, data);
      }
    });
  } else {
    // can't use cached when we're looking for a specific timestamp
    getTradesServer(ticker, timestamp, callback);
  }
}

function getTradesServer(ticker, timestamp, callback) {
  var params = {
    operation: "list",
    ticker: ticker,
    timestamp: timestamp,
    limit: gameConfig.readServerLimit
  }

  paginateLambdaRequest([], params, function(err,data) {

    if(gameConfig.logging) {
      cashRules.push(d3.sum(data.map(ƒ('cash','1','cash'))));
    }

    var returnData = {
      "returns": data.map(ƒ('return')),
      "trades": [].concat.apply([], data.map(ƒ('trades')))
      // "nestedTrades": data.map(ƒ('trades'))
    };

    returnData.trades.forEach(function(pair) {
      pair.forEach(function(endpoint) {
        endpoint.price = +endpoint.price;
        endpoint.date = new Date(endpoint.date);
      })
    });

    console.log("$" + ticker + ": " + returnData.trades.length + " trades from " + returnData.returns.length + " playthroughs.");
    // console.log("//// ALL DATA FOR " + ticker.toUpperCase() + " ////");
    // console.log(JSON.stringify(data));
    // console.log("//// COMPRESSED ////");
    // console.log(JSON.stringify(returnData));
    // console.log("//// END DATA FOR " + ticker.toUpperCase() + " ////");

    callback(err, returnData);
  })
}

function paginateLambdaRequest(results, params, callback) {

  if(!lambda) {
    if(callback) callback.call(this, new Error("Lambda not defined; AWS failed us!"));
    return false;
  }

  // console.log("requesting with", JSON.stringify(params));

  lambda.invoke({
    FunctionName: gameConfig.readServer,
    Payload: JSON.stringify(params)
  }, function(err, data) {

    if (!err) {
      data = JSON.parse(data.Payload)
      results = results.concat(data.Items);

      console.log(results.length, data.Count, params.limit, data.LastEvaluatedKey);

      if(data.LastEvaluatedKey !== undefined && (params.limit === undefined || data.Count < params.limit)) {
        if(params.limit) params.limit -= data.Count;
        params.startKey = data.LastEvaluatedKey;
        paginateLambdaRequest(results, params, callback);
      } else {
        callback(err,results);
      }

    } else {
      console.log("err: " + err);
      callback(err, results);
    }

  });

}

function closest(accessor) {
  var bi = d3.bisector(accessor).right;
  return function(array, item) {
    var i = bi(array, item);
    var left = array[i-1];
    var right = array[i];

    var dLeft = (left !== undefined) ? Math.abs(accessor(left) - item) : Infinity;
    var dRight = (right !== undefined) ? Math.abs(accessor(right) - item) : Infinity;

    return dLeft <= dRight ? left : right;
  }
}

function centerPopup(width, height) {
  var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
  var wTop = window.screenTop ? window.screenTop : window.screenY;
  var left = wLeft + (window.innerWidth / 2) - (width / 2);
  var top = wTop + (window.innerHeight / 2) - (height / 2);
  return 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
}



////////
// STATS

// based on http://bl.ocks.org/mbostock/3048450
function histogram() {

  var width = 960,
      height = 500,
      x,
      title,
      annotations = [];

  function chart(selection) {
    selection.each(function(values) {

      if(!values || !values.length) return;

      if(x === undefined) {
        // Either fit scale to middle 98% of values...
        values = values.filter(function(d) {
          return d >= d3.quantile(values,.01) && d < d3.quantile(values,.99);
        })
        x = d3.scale.linear()
            .domain(d3.extent(values))
            .range([0, width]);
      } else {
        // ...or fit values to scale.
        values = values.filter(function(d) {
          return d >= x.domain()[0] && d < x.domain()[1];
        })
      }

      // A formatter for counts.
      var formatCount = d3.format(",.0f");

      // Use date scale for dates, percentage scale otherwise. Sloppy, yes.
      if(values[0] instanceof Date) {
        var formatLabel = function(d) {
          var extent = d3.extent(values)[1] - d3.extent(values)[0];
          var format = d3.time.format.multi([
            [".%L", function(d) {   return extent < 1000; }],
            [":%S", function(d) {   return extent < 1000 * 60; }],
            ["%I:%M", function(d) { return extent < 1000 * 60 * 60; }],
            ["%I %p", function(d) { return extent < 1000 * 60 * 60 * 24; }],
            ["%a %d", function(d) { return extent < 1000 * 60 * 60 * 24 * 7; }],
            ["%b %d", function(d) { return extent < 1000 * 60 * 60 * 24 * 31; }],
            ["%B", function(d) {    return extent < 1000 * 60 * 60 * 24 * 365; }],
            ["%Y", function() {     return true; }]
          ]);
          return format(new Date(d));
        }
      } else {
        var formatLabel = d3.format(".0%");
      }

      // Generate a histogram using twenty uniformly-spaced bins.
      var data = d3.layout.histogram()
          .bins(75)
          (values);

      var y = d3.scale.linear()
          .domain([0, d3.max(data, function(d) { return d.y; })])
          .range([height, 0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .tickFormat(formatLabel);

      var svg = d3.select(this);

      var titleText = svg.selectAll("text.title").data([title]);
      titleText.enter().append("text.title");
      titleText.text(ƒ());

      var bar = svg.selectAll(".bar")
          .data(data);

      bar.exit().remove();

      var barEnter = bar.enter().append("g")
          .attr("class", "bar");

      svg.selectAll(".bar")
          .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

      barEnter.append("rect")
          .attr("x", 1);

      svg.selectAll(".bar").select("rect")
          .attr("width", x(data[1].x) - x(data[0].x))
          .attr("height", function(d) { return height - y(d.y); });

      // barEnter.append("text")
      //     .attr("dy", ".75em")
      //     .attr("y", 6)
      //     .attr("x", (x(data[1].x) - x(data[0].x)) / 2)
      //     .attr("text-anchor", "middle");

      // svg.selectAll(".bar").select("text")
      //     .text(function(d) { return formatCount(d.y); });

      svg.selectAll(".x.axis")
          .data([data])
        .enter().append("g")
          .attr("class", "x axis");

      svg.selectAll(".x.axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      var annos = svg.selectAll("g.annotation")
        .data(annotations);
      var annoEnter = annos.enter().append("g.annotation");
      annoEnter.append("line");
      annoEnter.append("text");
      annos
        .attr("transform", function(d) { return "translate(" + x(d.x) + ",0)"; })
      annos.select("line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", function(d,i) { return .3*height + i * 12})
        .attr("y2", height);
      annos.select("text")
        .text(ƒ('text'))
        .attr("y", function(d,i) { return .3*height + i * 12})
        .attr("dy", "-.5em");

    })
  }

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.x = function(_) {
    if (!arguments.length) return x;
    x = _;
    return chart;
  };

  chart.title = function(_) {
    if (!arguments.length) return title;
    title = _;
    return chart;
  };

  chart.annotations = function(_) {
    if (!arguments.length) return annotations;
    _.sort(function(a,b) { return b.x - a.x; });
    annotations = _;
    return chart;
  };

  return chart;
}

