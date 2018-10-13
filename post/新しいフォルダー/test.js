$(function () {
  searchWord = function(){
    var searchResult,
        searchText = $(this).val(), // �����{�b�N�X�ɓ��͂��ꂽ�l
        targetText,
        hitNum;

    // �������ʂ��i�[���邽�߂̔z���p��
    searchResult = [];

    // �������ʃG���A�̕\������ɂ���
    $('#search-result__list').empty();
    $('.search-result__hit-num').empty();

    // �����{�b�N�X�ɒl�������Ă�ꍇ
    if (searchText != '') {
      $('.target-area li').each(function() {
        targetText = $(this).text();

        // �����ΏۂƂȂ郊�X�g�ɓ��͂��ꂽ�����񂪑��݂��邩�ǂ����𔻒f
        if (targetText.indexOf(searchText) != -1) {
          // ���݂���ꍇ�͂��̃��X�g�̃e�L�X�g��p�ӂ����z��Ɋi�[
          searchResult.push(targetText);
        }
      });

      // �������ʂ��y�[�W�ɏo��
      for (var i = 0; i < searchResult.length; i ++) {
        $('<span>').text(searchResult[i]).appendTo('#search-result__list');
      }

      // �q�b�g�̌������y�[�W�ɏo��
      hitNum = '<span>��������</span>�F' + searchResult.length + '��������܂����B';
      $('.search-result__hit-num').append(hitNum);
    }
  };

  // searchWord�̎��s
  $('#search-text').on('input', searchWord);
});