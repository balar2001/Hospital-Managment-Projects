//================== session
req.session.findUser = {
  id: findUser[0]._id,
  email: findUser[0].user_email,
  name: findUser[0].user_name
};

const dataUser = req.session.findUser
console.log("opopopopopop " + dataUser.id);