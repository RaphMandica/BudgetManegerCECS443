module.exports = (plugin) => {

  const sanitizeOutput = (user) => {
    const {
      password, resetPasswordToken, confirmationToken, ...sanitizedUser
    } = user; // be careful, you need to omit other private attributes yourself
    return sanitizedUser;
  };
  plugin.controllers.user.updateMe = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return ctx.response.status = 401;
    }
    await strapi.query('plugin::users-permissions.user').update({
      where: { id: ctx.state.user.id },
      data: ctx.request.body
    }).then((res) => {
      ctx.response.status = 200;
    })
    ctx.params.id = ctx.state.user.id;
    return plugin.controllers.user.update(ctx);
  }

  plugin.routes['content-api'].routes.push({
    method: 'POST',
    path: '/user/me',
    handler: 'user.updateMe',
    config: {
      prefix: "",
      policies: []
    },
    populate: ['*']
  });

  plugin.controllers.user.me = async (ctx) => {
    if (!ctx.state.user) {
      return ctx.unauthorized();
    }
    const user = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      ctx.state.user.id,
      { populate: ['profilePicture'] }
    );

    ctx.body = sanitizeOutput(user);
  };

  plugin.controllers.user.find = async (ctx) => {
    const users = await strapi.entityService.findMany(
      'plugin::users-permissions.user',
      { ...ctx.params, populate: ['*', 'avatar'] }
    );

    ctx.body = users.map(user => sanitizeOutput(user));
  };

  return plugin;
}