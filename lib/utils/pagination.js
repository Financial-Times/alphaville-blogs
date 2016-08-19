"use strict";

const _ = require('lodash');

exports.getRenderConfig = function (currentPage, totalPages, req) {
	const paginationStart = [];
	const paginationCenter = [];
	const paginationEnd = [];

	const queryParamsWithoutPage = _.omit(req.query, ['page']);
	const baseUrl = `${req.baseUrl}?${
			Object.keys(queryParamsWithoutPage).map(key => `${key}=${queryParamsWithoutPage[key]
		}${
			Object.keys(queryParamsWithoutPage).length ? '&' : ''
		}`).join('&')}`;

	let startPage = currentPage - 1;
	let endPage = currentPage + 1;

	if (startPage <= 0) {
    	endPage -= (startPage - 1);
    	startPage = 1;
	}

	if (endPage > totalPages) {
    	endPage = totalPages;
	}

	if (startPage > 1 && currentPage !== 3) {
		paginationStart.push({
			page: 1
		});
	}

	if (currentPage === 3) {
		paginationCenter.push({
			page: 1
		});
	}

	for (let i = startPage; i <= endPage; i++) {
		const obj = {
			page: i
		};
		if (i === currentPage) {
			obj.selected = true;
		}

		paginationCenter.push(obj);
	}

	if (endPage < totalPages && currentPage !== totalPages - 2) {
		paginationEnd.push({
			page: totalPages
		});
	}

	if (currentPage === totalPages - 2 && totalPages > endPage) {
		paginationCenter.push({
			page: totalPages
		});
	}

	return {
		show: {
			left: {
				page: currentPage - 1,
				enabled: currentPage === 1 ? false : true
			},
			start: paginationStart,
			dot1: paginationStart.length ? true : false,
			center: paginationCenter,
			dot2: paginationEnd.length ? true : false,
			end: paginationEnd,
			right: {
				page: currentPage + 1,
				enabled: currentPage === totalPages ? false : true
			}
		},
		baseUrl: baseUrl
	}
};
