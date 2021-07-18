export const validateObjectAttributes = (attrKeys: string[], obj: {}) => {
  return attrKeys.filter((val) => !obj.hasOwnProperty(val))
}