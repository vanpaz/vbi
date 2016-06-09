import * as Colors from 'material-ui/styles/colors'
import * as ColorManipulator from 'material-ui/utils/colorManipulator'
import Spacing from 'material-ui/styles/spacing'
import zIndex from 'material-ui/styles/zIndex'

export default {
  spacing: Spacing,
  zIndex: zIndex,
  fontFamily: 'Roboto, sans-serif',
  palette: {
    //primary1Color: Colors.cyan500,
    primary1Color: '#008fd5',
    primary2Color: Colors.cyan700,
    primary3Color: Colors.lightBlack,
    // accent1Color: Colors.pinkA200,
    // accent1Color: '#008fd5',
    accent1Color: '#f3742c',
    accent2Color: Colors.grey100,
    accent3Color: Colors.grey500,
    textColor: Colors.darkBlack,
    alternateTextColor: Colors.white,
    canvasColor: Colors.white,
    borderColor: Colors.grey300,
    disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
    pickerHeaderColor: Colors.cyan500,
  }
}
