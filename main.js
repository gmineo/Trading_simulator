// === UTILS ===
function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const day = ("0" + d.getDate()).slice(-2);
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

let currentStep = 0;

// PATCH: totalSteps dinamico, dopo lo shuffle dei tickers!
var tickers = [
  { "ticker": "aapl", "name": "APPLE" },
  { "ticker": "dell", "name": "DELL COMPUTER" },
  { "ticker": "ge", "name": "GENERAL ELECTRIC" },
];
tickers = _.shuffle(tickers);
const totalSteps = tickers.length;

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

// in cima a main.js, dopo le altre variabili
let titoliRend = [];
let sp500Rend  = []; 
let playedStockNames = [];

// Config vars by query string
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

// PATCH: cash come number sempre
var cash = 500;
var cashLiquid = true;
var levelNumber = 0;

var userId = Math.random().toString().split(".")[1];
var userHistory = {};

// PATCH: Safe localStorage
if(typeof(Storage) !== "undefined") {
  try {
    if(!localStorage.getItem("userId")) localStorage.setItem("userId", userId);
    else userId = localStorage.getItem("userId");

    if(!localStorage.getItem("cash")) localStorage.setItem("cash", cash);
    else cash = parseFloat(localStorage.getItem("cash")) || 500;

    if(!localStorage.getItem("userHistory")) localStorage.setItem("userHistory", JSON.stringify(userHistory));
    else userHistory = JSON.parse(localStorage.getItem("userHistory"));
  } catch(e) {
    console.error(e);
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
    "Are You Smarter Than a Trader?",

    "Trade or Fade?",

    "Who Wants to Be a Chartist?"
];

// gets s&p, then calls init
getIndexFund();

function getIndexFund() {
  d3.csv("spx.csv", function(error, data) {
    if (error) {
      console.error("Indice SPX non caricato:", error);
      init();  // Avvia comunque il gioco senza indice di riferimento
      return;
    }
    var parseDate = d3.time.format("%x").parse;
    data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.price = +d.price;
    });
    data.sort(function(a,b) { return a.date - b.date; });
    indexFund = {
      "ticker": "spx",
      "name": "SPX",
      "values": data
    }
    init();
  });
}

function init() {
  var isTerminal = false;
  var tickerIndex = tickers.map(function(d) { return d.ticker; }).indexOf(gameConfig.ticker);

  var buttonText = gameConfig.replay ? "Watch" : "Play";
  if(gameConfig.ticker) buttonText += " " + gameConfig.ticker.toUpperCase();
  if(gameConfig.gameid) buttonText += " challenge";
  window.dvzqueue = queue;
  d3.select(".opener")
  .select(".play-btn")
  .on("click", function() {
    // Azzera il capitale a 500 all'inizio di ogni partita
    cash = 500;
    if(typeof(Storage) !== "undefined") {
      localStorage.setItem("cash", cash);
    }

    // PATCH: nascondi la barra branding
    d3.select(".top-header-bar").classed("hide", true);
    currentStep = 1;
    d3.select(".title-counter").text(currentStep + "/" + totalSteps);
    getNextLevel();
  })
  .on("touchstart", function() { d3.select(this).classed("hover", true); })
  .on("touchend", function() { d3.select(this).classed("hover", false); });

  if(d3.select(".opener h3").empty()) {
    d3.select(".opener").append("h3").text(_.sample(taglines));
  } else {
    d3.select(".opener h3").text(_.sample(taglines));
  }
   

  if(gameConfig.autoplay) getNextLevel();
}

// Da qui in poi: **tutto il codice originale per livelli, playLevel, helpers, ads, canvas, AWS, etc.**
// (già incluso nella tua versione. Lo lascio invariato, qui di seguito:)

// ... TUTTO IL RESTO DEL TUO main.js ...
// == (dal caricamento livelli, playLevel, getSmoothDomainFunction, getStdev, timerFormat, getQueryVariable, canvas, ads, AWS, ecc.) ==

// (Se serve la versione *con tutto* già incollato, dimmelo e te la incollo interamente in risposta! Altrimenti puoi semplicemente incollare sopra la parte iniziale.)



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
  const formatDate = (d) => new Date(d).toLocaleDateString('it-CH', {
    year:  'numeric',
    month: '2-digit',
    day:   '2-digit'
  });



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
    "challengeUrl": window.location.href,
    "spxStart": spxt0.price,
    "spxEnd":   spxt1.price,
    "spxStartDate":  spxt0.date,
    "spxEndDate":    spxt1.date
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

    var toolbar = item.insert("div", ":first-child").attr("class", "toolbar");
    var alerts = item.append("div.alerts")
        .style("position", "fixed")
        .style("bottom", "0")
        .style("left", "0");

    var cashHolder = toolbar.append("div.cash");
    var cashLabel = cashHolder.append("span.net").text(dollarFormat(cash));
    var cashChange = cashHolder.append("div.change");
    var timeLabel = toolbar.append("div.time").text(timerFormat(duration));
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
        .attr("r", "25");

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
      // ─ adesso ─  (numeri puri)
      titoliRend.push(stock.traderReturn);   // 0.352
      sp500Rend.push(stock.indexReturn);     // -0.077
      playedStockNames.push(stock.name);

      // --- NUOVA LOGICA PER LA CARD DI RIEPILOGO ---
      
      // 1. Prepara i dati per la nuova card
      const cardData = {
        stockName: stock.name,
        startDate: formatDate(stock.spxStartDate),
        endDate: formatDate(stock.spxEndDate),
        strategyReturn: stock.traderReturn * 100, // Converti in percentuale
        buyHoldReturn: stock.stockReturn * 100,   // Converti in percentuale
        sp500Return: stock.indexReturn * 100,     // Converti in percentuale
        sp500Start: stock.spxStart,
        sp500End: stock.spxEnd
      };

      // 2. Definisci l'azione da eseguire al click su "Continua"
      const continueAction = () => {
        if (currentStep < totalSteps) {
          currentStep++;
        }
        // La funzione getNextLevel è già definita nel tuo codice
        getNextLevel();
      };

      // 3. Mostra la nuova card di riepilogo
      // Usiamo un piccolo timeout per far finire l'animazione del grafico
      setTimeout(() => {
        showStockRevealCard(cardData, continueAction);
      }, 1200); // 1.2 secondi di ritardo

      // --- FINE NUOVA LOGICA ---

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

/*  ─────  GAME‑OVER  ─────
    SOSTITUISCI QUESTA FUNZIONE CON LA NUOVA VERSIONE
*/
function gameOver() {
  // Mostra la top-header-bar se era nascosta
  d3.select('.top-header-bar').classed('hide', false);

  // Calcola le statistiche finali
  const mediaTitoli = d3.mean(titoliRend);
  const mediaSp500  = d3.mean(sp500Rend);

  // Prepara i dati per la nuova card
  const summaryData = {
    titoli: playedStockNames.map((name, i) => ({
      name: name,
      rendimento: titoliRend[i]
    })),
    mediaTitoli: mediaTitoli,
    mediaSp500: mediaSp500
  };

  // Mostra la nuova card di riepilogo finale
  showFinalSummaryCard(summaryData);

  // Debug
  if (gameConfig.logging) {
    console.table(analysisStats);
    console.table(cashRules);
  }
}

// RIMUOVI LA VECCHIA FUNZIONE showGameOverForm() SE ESISTE
/*
function showGameOverForm() {
  // ...tutto il vecchio codice...
}
*/


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

function x(width, height) {
  var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
  var wTop = window.screenTop ? window.screenTop : window.screenY;
  var left = wLeft + (window.innerWidth / 2) - (width / 2);
  var top = wTop + (window.innerHeight / 2) - (height / 2);
  return 'width=' + width + ',height=' + height + ',top=' + top + ',left=' + left;
}

/**
 * Mostra il modal di rivelazione dello stock.
 * @param {object} data - Dati dello stock.
 * @param {function} [onContinue] - Funzione da eseguire quando si clicca "Continua".
 */
function showStockRevealCard(data, onContinue) {
  // Rimuovi eventuali modal esistenti
  const existingOverlay = document.getElementById('stockRevealOverlay');
  const existingModal = document.getElementById('stockRevealModal');
  if (existingOverlay) existingOverlay.remove();
  if (existingModal) existingModal.remove();
  
  // Funzioni helper
  const getColorClass = (value) => (value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral');
  const formatPercent = (value) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  
  // Crea overlay
  const overlay = document.createElement('div');
  overlay.id = 'stockRevealOverlay';
  overlay.className = 'stock-reveal-overlay';
  
  // Crea modal
  const modal = document.createElement('div');
  modal.id = 'stockRevealModal';
  modal.className = 'stock-reveal-modal';
  
  // Contenuto del modal
  modal.innerHTML = `
    <div class="stock-modal-header">
      <h2 class="stock-modal-title">${data.stockName}</h2>
      <p class="stock-modal-period">${data.startDate} → ${data.endDate}</p>
    </div>
    <div class="stock-modal-body">
      <div class="performance-section">
        <div class="perf-row strategy">
          <span class="perf-label">La tua strategia:</span>
          <span class="perf-value ${getColorClass(data.strategyReturn)}">${formatPercent(data.strategyReturn)}</span>
        </div>
        <div class="perf-row buyhold">
          <span class="perf-label">Buy & Hold su questo stock:</span>
          <span class="perf-value ${getColorClass(data.buyHoldReturn)}">${formatPercent(data.buyHoldReturn)}</span>
        </div>
        <div class="perf-row sp500">
          <span class="perf-label">Buy & Hold su S&P 500:</span>
          <span class="perf-value ${getColorClass(data.sp500Return)}">${formatPercent(data.sp500Return)}</span>
        </div>
      </div>
      <div class="sp500-section">
        <div class="sp500-header"><i class="ri-line-chart-line"></i> Dettagli S&P 500</div>
        <div class="sp500-data">
          <div class="sp500-item">
            <span class="sp500-item-label">Valore iniziale:</span>
            <span class="sp500-item-value">${data.sp500Start.toFixed(2)}</span>
          </div>
          <div class="sp500-item">
            <span class="sp500-item-label">Valore finale:</span>
            <span class="sp500-item-value">${data.sp500End.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="stock-modal-footer">
      <button id="modal-continue-btn" class="modal-continue-btn"><i class="ri-arrow-right-line"></i> Continua</button>
    </div>
  `;
  
  // Aggiungi al DOM
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  
  // Funzione per chiudere e continuare
  const closeAndContinue = () => {
    closeStockRevealCard();
    if (typeof onContinue === 'function') {
      onContinue();
    }
  };

  // Aggiungi listener al pulsante
  document.getElementById('modal-continue-btn').addEventListener('click', closeAndContinue);
  
  // Chiudi cliccando sull'overlay
  overlay.addEventListener('click', closeAndContinue);

  // Mostra con animazione
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    modal.classList.add('visible');
  });
}

/**
 * Chiude il modal di rivelazione dello stock.
 */
function closeStockRevealCard() {
  const overlay = document.getElementById('stockRevealOverlay');
  const modal = document.getElementById('stockRevealModal');
  
  if (overlay) overlay.remove();
  if (modal) modal.remove();
}

/**
 * Mostra la card di riepilogo finale del gioco.
 * @param {object} data - Dati riassuntivi della partita.
 */
function showFinalSummaryCard(data) {
  // Rimuovi eventuali modal esistenti
  const existingOverlay = document.getElementById('finalSummaryOverlay');
  const existingModal = document.getElementById('finalSummaryModal');
  if (existingOverlay) existingOverlay.remove();
  if (existingModal) existingModal.remove();

  // Funzioni helper
  const formatPercent = (value) => `${value >= 0 ? '+' : ''}${(value * 100).toFixed(1)}%`;
  const getColorClass = (value) => (value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral');

  // Crea l'elenco HTML dei rendimenti dei singoli titoli
  const rendimentiHtml = data.titoli.map(t => `
    <div class="perf-row">
      <span class="perf-label">${t.name}</span>
      <span class="perf-value ${getColorClass(t.rendimento)}">${formatPercent(t.rendimento)}</span>
    </div>
  `).join('');

  // Crea overlay
  const overlay = document.createElement('div');
  overlay.id = 'finalSummaryOverlay';
  overlay.className = 'stock-reveal-overlay'; // Riusiamo lo stesso stile di overlay

  // Crea modal
  const modal = document.createElement('div');
  modal.id = 'finalSummaryModal';
  modal.className = 'stock-reveal-modal'; // Riusiamo lo stesso stile di modal

  // Contenuto del modal
  modal.innerHTML = `
    <div class="stock-modal-header">
      <h2 class="stock-modal-title">Game Over</h2>
      <p class="stock-modal-period">Riepilogo Finale</p>
    </div>
    <div class="stock-modal-body">
      <div class="performance-section">
        ${rendimentiHtml}
      </div>
      <div class="summary-totals">
        <div class="perf-row total">
          <span class="perf-label">Media Tuo Rendimento:</span>
          <span class="perf-value ${getColorClass(data.mediaTitoli)}">${formatPercent(data.mediaTitoli)}</span>
        </div>
        <div class="perf-row total">
          <span class="perf-label">Media Rendimento S&P 500:</span>
          <span class="perf-value ${getColorClass(data.mediaSp500)}">${formatPercent(data.mediaSp500)}</span>
        </div>
      </div>
    </div>
    <div class="stock-modal-footer">
      <button id="restart-game-btn" class="modal-continue-btn"><i class="ri-mail-line"></i> Continue</button>
    </div>
  `;

  // Aggiungi al DOM
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // Aggiungi listener al pulsante per andare alla pagina contatti
  document.getElementById('restart-game-btn').addEventListener('click', () => {
    window.location.href = 'contact.html';
  });

  // Mostra con animazione
  requestAnimationFrame(() => {
    overlay.classList.add('visible');
    modal.classList.add('visible');
  });
}
