import { Dashboard } from "./project.reducer";

export default {
  id: 'default',
  title: 'Dashboard',
  mainEvent: 'page_view',
  cards: [
    {
      style: 'chart',
      size: {
        md: 6,
        xs: 12,
      },
      data: [{
        event: 'page_view',
        title: 'Page Views',
        op: 'count',
      }]
    },
    {
      style: 'chart',
      size: {
        md: 6,
        xs: 12,
      },
      data: [{
        event: 'page_view',
        title: 'Visitors',
        op: 'unique',
        tag: 'cid'
      }]
    },
    {
      style: 'toplist',
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'page_view',
        tag: 'url_host',
        title: 'Domains',
        dataLabel: 'Domain',
        valueLabel: 'Page Views',
      }]
    },
    {
      style: 'toplist',
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'page_view',
        tag: 'url_path',
        title: 'Top URLs',
        dataLabel: 'URL',
        valueLabel: 'Page Views',
      }]
    },
    {
      style: 'toplist',
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'page_view',
        tag: 'ref_host',
        title: 'Sources',
        dataLabel: 'Source Domain',
        valueLabel: 'Page Views',
        unknownLabel: '(direct)',
      }]
    },
    {
      style: 'toplist',
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'page_view',
        tag: 'ref',
        title: 'Source URLs',
        dataLabel: 'Source URL',
        valueLabel: 'Page Views',
        unknownLabel: '(none)',
      }]
    },
    {
      style: 'toplist',
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'page_view',
        tag: 'ua_br',
        title: 'Browsers',
        dataLabel: 'Browser',
        valueLabel: 'Page Views',
        unknownLabel: '(unknown)',
      }, {
        event: 'page_view',
        tag: 'ua_os',
        title: 'Operating Systems',
        dataLabel: 'Operating System',
        valueLabel: 'Page Views',
        unknownLabel: '(other)',
      }]
    },
    {
      style: 'toplist',
      size: {
        lg: 3,
        md: 4,
        sm: 12
      },
      data: [{
        event: 'page_view',
        tag: 'ua_dv_t',
        title: 'Device Types',
        dataLabel: 'Device Type',
        valueLabel: 'Page Views',
        unknownLabel: '(unknown)',
      }, {
        event: 'page_view',
        tag: 'ua_dv_v',
        title: 'Vendors',
        dataLabel: 'Vendor',
        valueLabel: 'Page Views',
        unknownLabel: '(other)',
      }, {
        event: 'page_view',
        tag: 'ua_dv',
        title: 'Models',
        dataLabel: 'Model',
        valueLabel: 'Page Views',
        unknownLabel: '(other)',
      }]
    },
    {
      style: 'webvitals',
      size: {
        size: 12,
      },
      data: []
    }
  ]
} as Dashboard;
