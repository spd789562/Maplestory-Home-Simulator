export const getTheme = (mapId) => {
  switch (mapId) {
    case '001':
    case '871100000':
      return 'home_type_toturial'
    case '002':
    case '003':
    case '004':
    case '871100001':
    case '871100002':
    case '871100003':
      return 'home_theme_henesys'
    case '005':
    case '006':
    case '007':
    case '871100004':
    case '871100005':
    case '871100006':
      return 'home_theme_commerz'
    case '008':
    case '009':
    case '010':
    case '871100007':
    case '871100008':
    case '871100009':
      return 'home_theme_hallowween'
    case '011':
    case '871100010':
      return 'home_theme_newyear'
    case '012':
    case '013':
    case '014':
    case '871100011':
    case '871100012':
    case '871100013':
      return 'home_theme_lithharbor'
    case '015':
    case '016':
    case '017':
    case '871100014':
    case '871100015':
    case '871100016':
      return 'home_theme_christmax'
    default:
      return ''
  }
}

export const getType = (mapId) => {
  switch (mapId) {
    case '871100000':
    case '871100010':
      return 'home_type_basic'
    case '871100001':
    case '871100004':
    case '871100008':
    case '871100012':
      return 'home_type_right_curve_stair'
    case '871100013':
    case '871100014':
      return 'home_type_right_stair'
    case '871100002':
    case '871100005':
      return 'home_type_left_stair'
    case '871100003':
    case '871100006':
    case '871100009':
    case '871100013':
    case '871100015':
      return 'home_type_ladder'
    case '871100007':
      return 'home_type_center_stair'
    case '871100016':
      return 'home_type_hidden_stair'
    default:
      return 'home_type_basic'
  }
}
