import * as Yup from 'yup'
import jwt from 'jsonwebtoken'
import authConfig from '../../config/auth'
import User from '../models/User'

class SessionController {
  async store(request, response) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    })

    const userDataIncorrect = () => {
      return response
        .status(400)
        .json({ error: 'Make sure your info are correct' })
    }

    if (!(await schema.isValid(request.body))) userDataIncorrect()

    const { email, password } = request.body

    const user = await User.findOne({
      where: { email },
    })

    if (!user) userDataIncorrect()

    if (!(await user.checkPassword(password))) userDataIncorrect()

    return response.json({
      id: user.id,
      email,
      name: user.name,
      admin: user.admin,
      token: jwt.sign({ id: user.id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    })
  }
}

export default new SessionController()
