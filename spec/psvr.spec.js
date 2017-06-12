var request = require( "request" ),
    jschardet = require( "jschardet" ),
    Iconv = require( "iconv" ).Iconv,
    cheerio = require( "cheerio" ),
    assert  = require( "assert" );


function checkMessage( options ) {
  return new Promise( function( resolve, reject ) {
    request( { 
      url: options.url,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.63 Safari/537.36"
      },
      encoding: null
    }, function( error, response, body ) {
      var detectResult, decodedResult, $, result, iconv;

      if ( error ) {
        return reject( error );
      }
      
      detectResult = jschardet.detect( body );
      iconv = new Iconv( detectResult.encoding, "UTF-8//TRANSLIT//IGNORE" );
      decodedResult = iconv.convert( body ).toString();
      $ = cheerio.load( decodedResult );
      result = $( options.selector ).text();
      result = result.trim();

      if ( result !== options.expectMessage ) {
        postSlack( options.site + ": " + result + "\n" + options.url )
        .then( function() {
          return postSlack( "```" + decodedResult + "```" );
        } )
        .then( resolve, reject );
      } else {
        resolve();
      }
    } );
  } );
  
}

function postSlack( message ) {
  return new Promise( function( resolve, reject ) {
    request( {
      method: "POST",
      url: "https://hooks.slack.com/services/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",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify( {
        "text": message
      } )
    }, function( error, result, body ) {
      if ( error ) {
        return reject( error );
      }
      resolve();
    } );
  } );
}

function using( tests, fn ) {
  for ( var i in tests ) {
    fn( tests[ i ] );
  }
}

describe( "psvr", function() {
  var tests = [ /*{
        site: "Amazon",
        url: "https://www.amazon.co.jp/%E3%82%BD%E3%83%8B%E3%83%BC-%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96%E3%82%A8%E3%83%B3%E3%82%BF%E3%83%86%E3%82%A4%E3%83%B3%E3%83%A1%E3%83%B3%E3%83%88-SIEAgeRestriction-PlayStation-VR-Camera%E5%90%8C%E6%A2%B1%E7%89%88/dp/B01H03FQ44/ref=sr_1_1?ie=UTF8&qid=1497012667&sr=8-1&keywords=psvr",
        selector: "#product-alert-grid_feature_div > div > b:nth-child(1)",
        expectMessage: "※Amazon.co.jpが販売・発送する本商品の追加販売分は終了しました。"
      },*/ {
        site: "ビックカメラ",
        url: "http://www.biccamera.com/bc/c/sale/special/psvr/order-GI8a.jsp",
        selector: "#order > div > div > p.vr_period",
        expectMessage: "抽選販売申し込みは終了いたしました。"
      }, {
        site: "ヨドバシカメラ",
        url: "http://www.yodobashi.com/product/100000001003144538/",
        selector: "#js_buyBoxMain > ul > li > div > p",
        expectMessage: "予定数の販売を終了しました"
      }, { 
        site: "Joshin",
        url: "http://joshinweb.jp/game/38660.html",
        selector: "body > center > table:nth-child(2) > tbody > tr > td:nth-child(2) > table:nth-child(2) > tbody > tr > td:nth-child(3) > table:nth-child(6) > tbody > tr:nth-child(2) > td",
        expectMessage: "「該当の商品はございません」"
      }, {
        site: "TSUTAYA",
        url: "http://shop.tsutaya.co.jp/game/product/2033350000022/",
        selector: "#pbBlock4291298 > div > div.tolBoxB.clearfix > div > div > div > ul:nth-child(2) > li:nth-child(3)",
        expectMessage: "在庫なし"
      }, {
        site: "ソニーストア",
        url: "http://www.sony.jp/playstation/psvr/",
        selector: "body > div.s5-container > div.c5-row > div.c5-row__col2.c5-border--rightW > div > div > div > div > div > div > p",
        expectMessage: "予定販売数に達したため、現在販売を停止しています。次回販売は未定です。販売が決定した際は、本ページにてご案内いたします"
      } ];
  
  using( tests, function( test ) {
    it ( "should see " + test.site + " sells psvr", function( done ) {
      this.timeout( 200000 ); 
      checkMessage( test )
      .then( done, function( error ) {
        postSlack( "```\n" + JSON.stringify( error, "", "  " ) + "\n```" );
      } );
    } );
  } );
} );