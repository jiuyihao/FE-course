const wait=new Promise((res)=>{
    setTimeout(()=>{
      res(1000)
    })
  })
  function add(a,b){
    console.log('cur')
    return a+b
  }
 
  let aopFn=aop(add,{
    before:({arg})=>{console.log('before',arg)},
    after:({arg})=>{console.log('after',arg)}
  })
console.log('end',aopFn(1,2))
//before
//cur
//end 3
// after

//还有一个异步的
   let aopFnAsync=aop(add,{
    before:(async {arg})=>{console.log('after',arg)
    await wait()
    },
    after:({arg})=>{console.log('after',arg)}
  })