$(document).ready(function () {
	initBinds();
	function initBinds(){
		if ($('.update_basket').length>0) {
			$('.update_basket').bind('click', updateBasket);
		}
		if ($('.remove_basket').length>0) {
			$('.remove_basket').bind('click', removeFromBasket);
		}
		if ($('.fld_qty').length>0) {
			$('.fld_qty').bind('keypress', function(e){
				var code = e.keyCode ? e.keyCode : e.which;
				if (code==13) {
					updateBasket();
				}
			})
		}
	}

	function removeFromBasket(){
		var item = $(this).attr('rel');
		$.ajax({
			type: "POST",
			url: 'http://bazaar/mod/basket_remove.php',
			dataType: 'html',
			data: ({ id: item }),
			success: function(){
				refreshBigBasket();
				refreshSmallBasket();
			},
			error: function(){
				alert('An error occured.');
			}
		});
	}

	function refreshSmallBasket(){
		$.ajax({
			url: 'http://bazaar/mod/basket_small_refresh.php',
			dataType: 'json',
			success: function(data){
				$.each(data, function(k, v){
					$("#basket_left ." + k + " span").text(v);
				});
			},
			error: function(data){
				alert("An error has occured.");
			}
		});
	}

	function refreshBigBasket(){
		$.ajax({
			url:'http://bazaar/mod/basket_view.php',
			dataType: 'html',
			success: function(data){
				$('#big_basket').html(data);
				initBinds();
			},
			error: function(data){
				alert("An error occured");
			}
		});
	};

	if ($('.add_to_basket').length>0) {
		$('.add_to_basket').click(function(){
			var trigger = $(this);
			var param = trigger.attr("rel");
			var item = param.split("_");
			$.ajax({
				type: 'POST',
				url: 'http://bazaar/mod/basket.php',
				dataType: 'json',
				data: ({id : item[0], job : item[1]}),
				success: function(data){
					var new_id = item[0] + '_' + data.job;
					if (data.job != item[1]) {
						if (data.job == 0) {
							trigger.attr("rel", new_id);
							trigger.text("Remove from basket");
							trigger.addClass("red");
						} else {
							trigger.attr("rel", new_id);
							trigger.text("Add to basket");
							trigger.removeClass("red");
						}
						refreshSmallBasket();
					}
				},
				error: function(data){
					alert("An error occured");
				}
			});
			return false;
		});
	}

	function updateBasket(){
		$('#frm_basket :input').each(function(){
			var sid = $(this).attr('id').split('-');
			var val = $(this).val();
			$.ajax({
				type:'POST',
				url: 'http://bazaar/mod/basket-qty.php',
				data: ({ id: sid[1], qty:val }),
				success: function(){
					refreshSmallBasket();
					refreshBigBasket();
				},
				error: function(){
					alert("An error occured");
				}
			})
		})
	}

	// proceed to paypal
	if ($('.paypal').length>0) {
		$('.paypal').click(function(){
			var token = $(this).attr('id');
			var image = "<div style=\"text-align:center\">";
			image = image+"<img src=\"http://bazaar/images/loadinfo.net.gif\"";
			image = image+" alt=\"proceeding to paypal\">";
			image = image+"<br> Please wait while we are redirecting you to paypal...";
			image = image+"</div><div id=\"frm_pp\"></div>";
			$('#big_basket').fadeOut(400, function(){
				$(this).html(image).fadeIn(400, function(){
					sendToPP(token);
				})
			});
		});
	}

	function sendToPP(token){
		$.ajax({
			type: "POST",
			url: "http://bazaar/mod/paypal.php",
			data: ({token : token}),
			dataType: "html",
			success: function(data){
				$('#frm_pp').html(data);
				//submit automatically
				$('#frm_paypal').submit();
			}, 
			error: function(){
				alert('An error has occured.');
			}
		})
	}
});