var request = require('request');

function create(event) {

  let root = event.stageVariables.ProfileServiceRoot;

  function send(token, method, url, data) {
    return new Promise((resolve, reject) => {
      var options = {
        method: method,
        url: url,
        headers: {
          'Authorization': token ? 'Bearer ' + token : ''
        },
        body: data,
        // json: true
      };
      console.log('options: ' + JSON.stringify(options));
      return request(options, function(err, response, body) {
        console.log('err in send: ' + err);
        console.log('response: ' + JSON.stringify(response));
        console.log('body: ' + body);
        if (err || response.statusCode >= 400) {
          // log.system.error(response ? response.statusCode : err, 'profile service: failed ' + method + ' ' + url);
          // body && body.message && log.system.error(body.message);
          if (response && response.statusCode === 401) {
            reject(401);
          } else {
            reject(body ? body.message : err || response.statusCode);
          }
        } else {
          // log.system.debug(response.statusCode, 'profile service: success ' + method + ' ' + url);
          resolve(JSON.parse(body));
        }
      });
    });
  }

  function get(token, url) {
    return send(token, 'GET', url, null);
  }

  function fixPerson(profile) {
    return {
      id: profile.userId,
      tenantId: profile.tenantId,
      name: profile.name,
      employeeId: profile.employeeId,
      post: profile.post || '',
      tel1: profile.extensionPhone,
      tel2: profile.cellPhone,
      mail: profile.mail,
      image: profile.picture || ''
    };
  }



  function getPerson(token, personId) {
    // return Promise.resolve({'id':'arai_s@worksap.co.jp','name':'新井 成一','employeeId':'6057','post':'Site Reliability Engineering Div. hue operation Dept. Improvement Design Grp. Improvement Design Grp.付','mail':'arai_s@worksap.co.jp','image':'http://kanlinux/WhosWho/images/6057.jpg','tel':null});
    return get(token, root + '/profiles/' + personId).then((person) => {
      console.log('gotPerson: ' + person);
      return Promise.resolve(fixPerson(person));
    }).catch((e) => {
      console.log('e: ' + e);
      if (e === 404) {
        return Promise.resolve(null);
      }
      return Promise.reject(e);
    });
  }

  function getPeopleByIds(token, personIds) {
    return personIds.reduce((promise, personId) => {
      return promise.then(results => {
        return getPerson(token, personId).then(person => {
          if (person) {
            results.push(person);
          }
          return Promise.resolve(results);
        });
      });
    }, Promise.resolve([]));
  }

  function getPeopleByPost(token, post, exclusiveStartKey) {
    var url = root + '/profiles?q=' + encodeURIComponent('"' + post + '"') +
      (exclusiveStartKey ? '&exclusiveStartKey=' + exclusiveStartKey : '');
    return get(token, url).then((data) => {
      var people = data.profiles.map(fixPerson);
      if (data.lastEvaluatedKey) {
        return getPeopleByPost(token, post, data.lastEvaluatedKey).then((people2) => {
          return Promise.resolve(people.concat(people2));
        });
      } else {
        return Promise.resolve(people);
      }
    });
  }

  function search(token, query, exclusiveStartKey) {
    var url = root + '/profiles?q=' + encodeURIComponent(query) +
      (exclusiveStartKey ? '&exclusiveStartKey=' + exclusiveStartKey : '');
    return get(token, url).then((data) => {
      var people = data.profiles.map(fixPerson);
      if (data.lastEvaluatedKey) {
        return search(token, query, data.lastEvaluatedKey).then((people2) => {
          return Promise.resolve(people.concat(people2));
        });
      } else {
        return Promise.resolve(people);
      }
    });
  }

  return {
    getPerson: getPerson,
    search: search,
    getPeopleByPost: getPeopleByPost,
    getPeopleByIds: getPeopleByIds,
  };
}

module.exports = create;
