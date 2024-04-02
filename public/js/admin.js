// 349. Adding client side JS Code

const deleteProduct = btn => {
  const productId = btn.parentNode.querySelector('[name=productId]').value;
  const doubleCsrf = btn.parentNode.querySelector('[name=csrfToken]').value;
  const prodElement = btn.closest('article');

  fetch(`/admin/product/${productId}`, {
    method: 'DELETE',
    headers: { 'x-csrf-Token': doubleCsrf },
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      console.log(data);
      prodElement.parentNode.removeChild(prodElement);
    })
    .catch(err => {
      console.log(err);
    });
};
