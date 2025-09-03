const asyncHandler = (requestHandler) => 
    (req, res, next) => {

        Promise.resolve(requestHandler(req,res,next)).catch(next)
    }




export {asyncHandler}




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