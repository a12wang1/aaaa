var express = require('express');
var router = express.Router();

var async = require('async');
var Web3 = require('web3');


router.get('/', function(req, res, next) {
  
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3.setProvider(config.provider);
  var items = {};
  var pages = {};
  async.waterfall([
    function(callback) {
      web3.eth.getBlock("latest", false, function(err, result) {
        callback(err, result);
      });
    }, function(lastBlock, callback) {
      var blocks = [];
      pages.total = lastBlock.number;
      var blockCount = 10;
      if (pages.total % blockCount ==0) {
        pages.totalPages = pages.total /blockCount;
      }else{
        pages.totalPages = Math.ceil(pages.total /blockCount);
      }
      if (lastBlock.number - blockCount < 0) {
        blockCount = lastBlock.number + 1;
      }
      items.currentPage = 1;
      async.times(blockCount, function(n, next) {
        web3.eth.getBlock(lastBlock.number - n, true, function(err, block) {
          next(err, block);
        });
      }, function(err, blocks) {
        callback(err, blocks);
      });
    }
  ], function(err, blocks) {
    if (err) {
      return next(err);
    }
    
    var txs = [];
    blocks.forEach(function(block) {
      block.transactions.forEach(function(tx) {
        if (txs.length === 10) {
          return;
        }
        txs.push(tx);
      });
    });
    res.render('index', { blocks: blocks, txs: txs , items: items, pages : pages});
  });
  
});

router.get('/page:page', function(req, res, next) {
  
  var config = req.app.get('config');  
  var web3 = new Web3();
  web3.setProvider(config.provider);
  var items = {};
  async.waterfall([
    function(callback) {
      web3.eth.getBlock("latest", false, function(err, result) {
        callback(err, result);
      });
    }, function(lastBlock, callback) {
      var blocks = [];
      items.total = lastBlock.number;
      var blockCount = 10;
      if (lastBlock.number - blockCount < 0) {
        blockCount = lastBlock.number + 1;
      }
      items.currentPage = 3;
      async.times(blockCount, function(n, next) {
        web3.eth.getBlock(lastBlock.number - n, true, function(err, block) {
          next(err, block);
        });
      }, function(err, blocks) {
        callback(err, blocks);
      });
    }
  ], function(err, blocks) {
    if (err) {
      return next(err);
    }
    
    res.render('index', { blocks: blocks, items: items});
  });
  
});

module.exports = router;
