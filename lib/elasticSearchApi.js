
const elasticSearchUrl = process.env.ELASTIC_SEARCH_URL;
const index = 'v3_api_v2';
const signedFetch = require('signed-aws-es-fetch');

module.exports = {
	'searchArticles' : function(query){
		return signedFetch(`https://${elasticSearchUrl}/${index}/_search`, query).then(response => response.json());
	},
	'getArticle' : function(uuid){
		return signedFetch(`https://${elasticSearchUrl}/${index}/item/${uuid}`).then(response => response.json());
	}
};
