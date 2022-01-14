export const getTheme = (mapId) => {
  switch (mapId) {
    case '001':
    case '871100000':
      return 'toturial'
    case '002':
    case '003':
    case '004':
    case '871100001':
    case '871100002':
    case '871100003':
      return 'henesys'
    case '005':
    case '006':
    case '007':
    case '871100004':
    case '871100005':
    case '871100006':
      return 'commerz'
    case '008':
    case '009':
    case '010':
    case '871100007':
    case '871100008':
    case '871100009':
      return 'halloween'
    case '011':
    case '871100010':
      return 'newyear'
    case '012':
    case '013':
    case '014':
    case '871100011':
    case '871100012':
    case '871100013':
      return 'lithharbor'
    case '015':
    case '016':
    case '017':
    case '871100014':
    case '871100015':
    case '871100016':
      return 'christmax'
    case '018':
    case '019':
    case '020':
    case '871100017':
    case '871100018':
    case '871100019':
      return 'henesysExpand'
    case '021':
    case '022':
    case '023':
    case '871100020':
    case '871100021':
    case '871100022':
      return 'commerzExpand'
    case '024':
    case '025':
    case '026':
    case '871100023':
    case '871100024':
    case '871100025':
      return 'lithharborExpand'
    case '027':
    case '028':
    case '871100026':
    case '871100027':
      return 'newYearExpand'
    default:
      return ''
  }
}

export const getType = (mapId) => {
  switch (mapId) {
    case '871100000':
    case '871100010':
      return 'basic'
    case '871100001':
    case '871100004':
    case '871100008':
    case '871100012':
    case '871100017':
    case '871100020':
    case '871100024':
      return 'right_curve_stair'
    case '871100013':
    case '871100014':
      return 'right_stair'
    case '871100002':
    case '871100005':
    case '871100018':
    case '871100021':
      return 'left_stair'
    case '871100003':
    case '871100006':
    case '871100009':
    case '871100013':
    case '871100015':
    case '871100022':
    case '871100019':
    case '871100025':
    case '871100026':
      return 'ladder'
    case '871100007':
    case '871100027':
      return 'center_stair'
    case '871100016':
      return 'hidden_stair'
    default:
      return 'basic'
  }
}
