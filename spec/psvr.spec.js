var request = require( "request" ),
    cheerio = require( "cheerio" ),
    assert  = require( "assert" );

// postSlack( "test" );

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
      console.log( result );
      resolve();
    } );
  } );
}

describe( "psvr", function() {
  it( "should see amazon sells psvr", function( done ) {
    this.timeout( 200000 ); 
    request( { 
      url: "https://www.amazon.co.jp/%E3%82%BD%E3%83%8B%E3%83%BC-%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%A9%E3%82%AF%E3%83%86%E3%82%A3%E3%83%96%E3%82%A8%E3%83%B3%E3%82%BF%E3%83%86%E3%82%A4%E3%83%B3%E3%83%A1%E3%83%B3%E3%83%88-SIEAgeRestriction-PlayStation-VR-Camera%E5%90%8C%E6%A2%B1%E7%89%88/dp/B01H03FQ44/ref=sr_1_1?ie=UTF8&qid=1497012667&sr=8-1&keywords=psvr",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.63 Safari/537.36"
      }
    }, function( error, response, body ) {
      var $ = cheerio.load( body ), result;
      result = $( "#product-alert-grid_feature_div > div > b:nth-child(1)" ).text();
      if ( result === "※Amazon.co.jpが販売・発送する本商品の追加販売分は終了しました。a" ) {
        postSlack( result ).then( done, done );
      } else {
        done();
      }
    } );
  } );
} );