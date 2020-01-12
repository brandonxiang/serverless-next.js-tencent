const defaultPath = 'nextjs'

const normaliseUri = uri =>  {
  const re = new RegExp(`/${defaultPath}`, 'i');
  const url =  uri.replace(re, '');
  return url === '/' ? '/index' : url;
}

exports.handler = async event => {
  const uri = normaliseUri(event.path);
}