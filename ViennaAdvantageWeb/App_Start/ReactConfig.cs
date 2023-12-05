using React;

[assembly: WebActivatorEx.PreApplicationStartMethod(typeof(ViennaAdvantageWeb.ReactConfig), "Configure")]

namespace ViennaAdvantageWeb
{
	public static class ReactConfig
	{
		public static void Configure()
		{
			ViennaBase.ReactConfig.Configure();			
		}
	}
}