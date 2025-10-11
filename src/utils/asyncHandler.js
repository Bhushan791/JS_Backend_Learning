
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
}


export { asyncHandler };

// 🎬 In short — the story:

// Every time a request arrives, asyncHandler wraps your async controller in a safety blanket.
// If the controller throws an error, asyncHandler catches it and forwards it nicely instead of crashing the server.










// const asyncHandler = (requestHandler) => 
//     (req, res, next) => {

//         Promise.resolve(requestHandler(req,res,next)).catch(next)
//     }





//     }
// }




///soul purpose :Basically: I take care of your async errors so you don’t have to write try/catch everywhere.



// const asyncHandler = (fn)=> async (req, res, next)=>{
//     try{
//         await fn(req, res, next)

//     }
//     catch(error){
//         res.status(error.code||500).json({
//             success:false,
//             message: error.message

//         })

//     }
// }