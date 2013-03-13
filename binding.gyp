{
  'targets': [
    {
      'target_name': 'windows',
      'conditions': [ [
		'OS=="win"',
		{
	      'sources': [ 'platforms/windows.cc' ],
	      'msvs_settings': {
	        'VCLinkerTool': {
	          'AdditionalDependencies': [
	            'Crypt32.lib'
	          ]
	        }
	      }		
		}
	  ] ]
    }
  ]
}