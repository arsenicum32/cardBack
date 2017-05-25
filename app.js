import express from 'express'
import cors from 'cors'
import walk from 'walk'
import fs from 'fs'
import Chance from 'chance'

import {parse} from './parse'

import bot from './bot'

const chance = new Chance();

const app = express()

app.use(cors())


app.get('/', (req,res)=>{
  const walker = walk.walk("./dics/");
  var ar = [];
  walker.on("file", (root, fileStats, next)=> {
    ar.push(fileStats.name)
    // fs.readFile(fileStats.name, _=> {
    //   next();
    // });
    next();
  });
  walker.on("errors", (root, nodeStatsArray, next)=> next() );
  walker.on("end", _=> res.json(ar) );
})

app.get('/get/:id', (req,res)=>{
  const walker = walk.walk("./dics/");
  var ar = [];
  walker.on("file", (root, fileStats, next)=> {
    console.log(fileStats.name.split('.')[0]  == req.params.id);
    if( fileStats.name.split('.')[0] == req.params.id ) {
      fs.readFile("./dics/" + fileStats.name, 'utf-8' , (err, data)=> {
        return res.json(err ? {error: err} : {data: parse(data) } )
      });
    }else{
      next();
    }
  });
  walker.on("errors", (root, nodeStatsArray, next)=> next() );
  walker.on("end", _=> res.json(ar) );
})

app.get('/hard/:id', (req,res)=>{
  fs.writeFile(`./dics/${req.params.id}.json`, "[]", err=> err?res.json({error: err}):res.json({s:req.params.id}) );
})

app.get('/set/:id/:a/:b', (req,res)=>{
  const walker = walk.walk("./dics/");
  var ar = [];
  walker.on("file", (root, fileStats, next)=> {
    console.log(fileStats.name.split('.')[0]  == req.params.id);
    if( fileStats.name.split('.')[0] == req.params.id ) {
      fs.readFile("./dics/" + fileStats.name, 'utf-8' , (err, data)=> {
        let d = parse(data);
        if(d){
          d.push({
            lean: req.params.a,
            answer: req.params.b,
            s: 0,
            q: 0,
            t: (new Date()).getTime()
          })
        }
        if(!err && d){
          fs.writeFile(`./dics/${req.params.id}.json`,
            JSON.stringify(d),
            er=> er?res.json({error: er}): res.json({s:req.params.id}) );
        }else{
          res.json({error: 1});
        }
      });
    }else{
      next();
    }
  });
  walker.on("errors", (root, nodeStatsArray, next)=> next() );
  walker.on("end", _=> res.json(ar) );
})


app.get('/check/:id/:n/:p', (req,res)=>{
  const walker = walk.walk("./dics/");
  var ar = [];
  walker.on("file", (root, fileStats, next)=> {
    if( fileStats.name.split('.')[0] == req.params.id ) {
      fs.readFile("./dics/" + fileStats.name, 'utf-8' , (err, data)=> {
        let d = parse(data);
        if(d&&d[req.params.n]){
          d[req.params.n].q +=1;
          if(
            typeof parseFloat(d[req.params.n].s) == typeof 0.4
            &&
            typeof parseFloat(req.params.p) == typeof 0.4
          ){
            d[req.params.n].s = (( parseFloat(d[req.params.n].s) + parseFloat(req.params.p) ) / 2 ).toFixed(3)
          }else{
            d[req.params.n].s = 0.0
          }
        }
        if(!err && d){
          fs.writeFile(`./dics/${req.params.id}.json`,
            JSON.stringify(d),
            er=> er?res.json({error: er}): res.json({s:req.params.id}) );
        }else{
          res.json({error: 1});
        }
      });
    }else{
      next();
    }
  });
  walker.on("errors", (root, nodeStatsArray, next)=> next() );
  walker.on("end", _=> res.json(ar) );
})

app.get('/rand/:id/', (req,res)=>{
  const walker = walk.walk("./dics/");
  var ar = [];
  walker.on("file", (root, fileStats, next)=> {
    if( fileStats.name.split('.')[0] == req.params.id ) {
      fs.readFile("./dics/" + fileStats.name, 'utf-8' , (err, data)=> {
        let d = parse(data);
        if(!err && d){
          var mn = chance.pick(d);
          res.json({
            result: mn,
            id: d.indexOf(mn)
          })
        }else{
          res.json({error: 1});
        }
      });
    }else{
      next();
    }
  });
  walker.on("errors", (root, nodeStatsArray, next)=> next() );
  walker.on("end", _=> res.json(ar) );
})

app.listen(9000)
